import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { OrderItemException } from './order-item.exception';
import { OrderItemValidation } from './order-item.validation';

@Injectable()
export class OrderItemUtils {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getOrderItem(where: FindOptionsWhere<OrderItem>) {
    const orderItem = await this.orderItemRepository.findOne({
      where,
    });
    if (!orderItem) {
      throw new OrderItemException(OrderItemValidation.ORDER_ITEM_NOT_FOUND);
    }
    return orderItem;
  }
}
