import { Order } from './order.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { OrderValidation } from './order.validation';
import { OrderException } from './order.exception';
import { Voucher } from 'src/voucher/voucher.entity';
import { OrderStatus } from './order.constants';
import moment from 'moment';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class OrderUtils {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly menuItemUtils: MenuItemUtils,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  async getOrder(options: FindOneOptions<Order>) {
    const order = await this.orderRepository.findOne({
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
      ...options,
    });
    if (!order) {
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }
    return order;
  }

  /**
   * Calculate the subtotal of an order.
   * @param {Order} order order.
   * @returns {Promise<number>} The subtotal of order
   */
  async getOrderSubtotal(order: Order, voucher?: Voucher): Promise<number> {
    let discount = 0;
    const subtotal = order.orderItems?.reduce(
      (previous, current) => previous + current.subtotal,
      0,
    );
    if (voucher) discount = (subtotal * voucher.value) / 100;
    return subtotal - discount;
  }

  async deleteOrder(orderSlug: string) {
    const context = `${OrderUtils.name}.${this.deleteOrder.name}`;
    this.logger.log(`Cancel order ${orderSlug}`, context);

    const order = await this.getOrder({
      where: {
        slug: orderSlug,
      },
    });

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
        // Update stock of menu items
        await manager.save(menuItems);
        this.logger.log(
          `Menu items: ${menuItems.map((item) => item.product.name).join(', ')} updated`,
          context,
        );

        // Remove order items
        if (order.orderItems) await manager.remove(order.orderItems);

        // Remove order
        const removedOrder = await manager.remove(order);

        // Remove payment
        if (payment) {
          await manager.remove(payment);
          this.logger.log(`Payment has been removed`, context);
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
}
