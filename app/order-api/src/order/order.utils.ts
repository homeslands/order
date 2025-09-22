import { Order } from './order.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  FindOneOptions,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { OrderValidation } from './order.validation';
import { OrderException } from './order.exception';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { OrderStatus } from './order.constants';
import moment from 'moment';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import * as _ from 'lodash';
import { PaymentUtils } from 'src/payment/payment.utils';
import {
  VoucherApplicabilityRule,
  VoucherType,
} from 'src/voucher/voucher.constant';
import { Invoice } from 'src/invoice/invoice.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccumulatedPointService } from 'src/accumulated-point/accumulated-point.service';

@Injectable()
export class OrderUtils {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly menuItemUtils: MenuItemUtils,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly paymentUtils: PaymentUtils,
    private readonly eventEmitter: EventEmitter2,
    private readonly accumulatedPointService: AccumulatedPointService,
  ) {}

  async getOrder(options: FindOneOptions<Order>) {
    const order = await this.orderRepository.findOne({
      relations: [
        'payment',
        'owner.role',
        'approvalBy',
        'orderItems.chefOrderItems',
        'orderItems.variant.size',
        'orderItems.variant.product',
        'orderItems.promotion',
        'orderItems.trackingOrderItems.tracking',
        'invoice.invoiceItems',
        'table',
        'voucher.voucherProducts.product',
        'voucher.voucherPaymentMethods',
        'branch.addressDetail',
        'chefOrders.chefOrderItems',
        'deliveryTo',
      ],
      order: {
        createdAt: 'ASC',
      },
      ...options,
    });
    if (!order) {
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }
    return order;
  }

  async getBulkOrders(options: FindManyOptions<Order>): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      relations: [
        'payment',
        'owner.role',
        'approvalBy',
        'orderItems.chefOrderItems',
        'orderItems.variant.size',
        'orderItems.variant.product',
        'orderItems.promotion',
        'orderItems.trackingOrderItems.tracking',
        'invoice.invoiceItems',
        'table',
        'voucher',
        'branch.addressDetail',
        'deliveryTo',
        'chefOrders.chefOrderItems',
      ],
      order: {
        createdAt: 'ASC',
      },
      ...options,
    });

    return orders;
  }

  /**
   * Calculate the subtotal of an order.
   * @param {Order} order order.
   * @returns {Promise<number>} The subtotal of order (include delivery fee)
   * @returns {Promise<number>} The original subtotal of order (exclude delivery fee)
   * @returns {Promise<number>} The voucher value items total of order
   */
  async getOrderSubtotal(
    order: Order,
    voucher?: Voucher,
  ): Promise<{
    subtotal: number;
    voucherValueItemsTotal: number;
    originalSubtotal: number;
  }> {
    let discount = 0;
    const subtotal = order.orderItems?.reduce(
      (previous, current) => previous + current.subtotal,
      0,
    );
    const originalSubtotal = order.orderItems?.reduce(
      (previous, current) => previous + current.originalSubtotal,
      0,
    );
    const voucherValueItemsTotal = order.orderItems?.reduce(
      (previous, current) => previous + current.voucherValue,
      0,
    );
    if (voucher) {
      if (voucher.applicabilityRule === VoucherApplicabilityRule.ALL_REQUIRED) {
        switch (voucher.type) {
          case VoucherType.PERCENT_ORDER:
            if (voucher) discount = (subtotal * voucher.value) / 100;
            break;
          case VoucherType.FIXED_VALUE:
            if (subtotal > voucher.value) {
              discount = voucher.value;
            } else {
              discount = subtotal;
            }
            break;
          default:
            break;
        }
      }
    }

    return {
      // include delivery fee
      subtotal: subtotal - discount + order.deliveryFee,
      voucherValueItemsTotal,
      // exclude delivery fee
      originalSubtotal,
    };
  }

  async deleteOrder(orderSlug: string) {
    const context = `${OrderUtils.name}.${this.deleteOrder.name}`;
    this.logger.log(`Cancel order ${orderSlug}`, context);

    const order = await this.orderRepository.findOne({
      where: {
        slug: orderSlug,
      },
      relations: [
        'payment',
        'owner',
        'approvalBy',
        'orderItems.chefOrderItems',
        'orderItems.variant.size',
        'orderItems.variant.product',
        'orderItems.promotion',
        'orderItems.trackingOrderItems.tracking',
        'invoice.invoiceItems',
        'table',
        'voucher',
        'branch',
        'chefOrders.chefOrderItems',
      ],
    });

    if (!order) {
      this.logger.warn(`Order ${orderSlug} not found`, context);
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${orderSlug} is not pending`, context);
      return;
    }
    // Get all menu items base on unique products
    const orderDate = new Date(moment(order.createdAt).format('YYYY-MM-DD'));
    const menuItems = await this.menuItemUtils.getCurrentMenuItems(
      order,
      orderDate,
      'increment',
    );

    const { payment, table, voucher } = order;

    // Delete order
    const removedOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        // Cancel accumulated points reservation
        await this.accumulatedPointService.handleCancelReservation(order.id);
        // Update subtotal and accumulated points to use in order
        const subtotalBeforeUseAccumulatedPoints =
          order.subtotal + order.accumulatedPointsToUse;
        order.accumulatedPointsToUse = 0;
        order.subtotal = subtotalBeforeUseAccumulatedPoints;
        await manager.save(order);

        // Update stock of menu items
        await manager.save(menuItems);
        this.logger.log(
          `Menu items: ${menuItems.map((item) => item.product.name).join(', ')} updated`,
          context,
        );

        // Remove order items
        if (order.orderItems) await manager.softRemove(order.orderItems);

        // Remove order
        const removedOrder = await manager.softRemove(order);

        // Remove payment
        if (payment) {
          // await manager.softRemove(payment);
          // this.logger.log(`Payment has been removed`, context);
          await this.paymentUtils.cancelPayment(payment.slug);
        }

        // Update table status if order is at table
        if (table) {
          table.status = 'available';
          await manager.save(table);
          this.logger.log(`Table ${table.name} is available`, context);
        }

        // Update voucher remaining quantity
        if (voucher) {
          voucher.remainingUsage += 1;
          await manager.save(voucher);
          this.logger.log(
            `Voucher ${voucher.code} remaining usage updated`,
            context,
          );
        }
        return removedOrder;
      },
      () => {
        this.logger.log(`Order ${orderSlug} has been canceled`, context);
      },
      (error) => {
        this.logger.error(
          `Error when cancel order ${orderSlug}: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
    return removedOrder;
  }

  async getMinAndMaxReferenceNumberForBranch(
    branchId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    minReferenceNumberOrder: number;
    maxReferenceNumberOrder: number;
  }> {
    const invoices = await this.invoiceRepository.find({
      where: {
        branchId: branchId,
        date: Between(startDate, endDate),
        referenceNumber: Not(IsNull()),
      },
      order: {
        referenceNumber: 'ASC',
      },
    });
    return {
      minReferenceNumberOrder: _.first(invoices)?.referenceNumber ?? 0,
      maxReferenceNumberOrder: _.last(invoices)?.referenceNumber ?? 0,
    };
  }
}
