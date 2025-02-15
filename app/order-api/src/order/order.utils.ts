import { Order } from './order.entity';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { OrderValidation } from './order.validation';
import { OrderException } from './order.exception';
import { MenuUtils } from 'src/menu/menu.utils';
import { Voucher } from 'src/voucher/voucher.entity';

export class OrderUtils {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly menuUtils: MenuUtils,
  ) {}

  async getOrder(options: FindOneOptions<Order>) {
    const order = await this.orderRepository.findOne({
      relations: [
        'payment',
        'owner',
        'approvalBy',
        'orderItems.variant.size',
        'orderItems.variant.product',
        'orderItems.promotion',
        'orderItems.trackingOrderItems.tracking',
        'invoice.invoiceItems',
        'table',
        'voucher',
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
}
