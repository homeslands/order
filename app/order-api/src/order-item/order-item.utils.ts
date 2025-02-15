import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { OrderItemException } from './order-item.exception';
import { OrderItemValidation } from './order-item.validation';
import { Promotion } from 'src/promotion/promotion.entity';

@Injectable()
export class OrderItemUtils {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getOrderItem(options: FindOneOptions<OrderItem>): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      relations: ['order', 'variant.product', 'variant.size'],
      ...options,
    });
    if (!orderItem) {
      throw new OrderItemException(OrderItemValidation.ORDER_ITEM_NOT_FOUND);
    }
    return orderItem;
  }

  calculateSubTotal(
    orderItem: OrderItem,
    promotion?: Promotion
  ) {
    let discount = 0;
    if(promotion) {
      const percentPromotion = promotion.value;
      discount = orderItem.quantity * orderItem.variant.price * percentPromotion/100;
    }
    const subtotal = orderItem.quantity * orderItem.variant.price;
    return subtotal - discount;
  }
}
