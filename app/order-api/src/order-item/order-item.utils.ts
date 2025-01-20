import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { OrderItemException } from './order-item.exception';
import { OrderItemValidation } from './order-item.validation';

@Injectable()
export class OrderItemUtils {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getOrderItem(options: FindOneOptions<OrderItem>): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      relations: ['order'],
      ...options,
    });
    if (!orderItem) {
      throw new OrderItemException(OrderItemValidation.ORDER_ITEM_NOT_FOUND);
    }
    return orderItem;
  }

  async calculateSubTotal(orderItem: OrderItem) {
    return orderItem.quantity * orderItem.variant.price;
  }
}
