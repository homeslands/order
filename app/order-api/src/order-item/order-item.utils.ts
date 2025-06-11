import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { OrderItemException } from './order-item.exception';
import { OrderItemValidation } from './order-item.validation';
import { Promotion } from 'src/promotion/promotion.entity';
import { Voucher } from 'src/voucher/voucher.entity';
import { VoucherType } from 'src/voucher/voucher.constant';
import { DiscountType } from 'src/order/order.constants';

@Injectable()
export class OrderItemUtils {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getOrderItem(options: FindOneOptions<OrderItem>): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      relations: [
        'order.branch',
        'variant.product',
        'variant.size',
        'order.voucher.voucherProducts.product',
      ],
      ...options,
    });
    if (!orderItem) {
      throw new OrderItemException(OrderItemValidation.ORDER_ITEM_NOT_FOUND);
    }
    return orderItem;
  }

  calculateSubTotal(
    orderItem: OrderItem,
    promotion?: Promotion,
    voucher?: Voucher,
  ): {
    subtotal: number;
    voucherValue: number;
  } {
    let discountPromotion = 0;
    if (promotion) {
      const percentPromotion = promotion.value;
      discountPromotion =
        (orderItem.quantity * orderItem.variant.price * percentPromotion) / 100;
    }
    const subtotal = orderItem.quantity * orderItem.variant.price;

    if (voucher) {
      switch (voucher.type) {
        case VoucherType.SAME_PRICE_PRODUCT:
          let voucherValue = 0;
          if (orderItem.variant.price - voucher.value > 0) {
            voucherValue =
              (orderItem.variant.price - voucher.value) * orderItem.quantity;
            return {
              subtotal: orderItem.quantity * voucher.value,
              voucherValue,
            };
          } else {
            // voucher value is greater than variant price
            // use price of variant
            return {
              subtotal: orderItem.quantity * orderItem.variant.price,
              voucherValue: 0,
            };
          }

        default:
          break;
      }
    }

    return {
      subtotal: subtotal - discountPromotion,
      voucherValue: 0,
    };
  }

  /**
   * Update or Update order item: subtotal, voucherValue, discountType, originalSubtotal
   * @param voucher
   * @param orderItem
   * @param isAddVoucher
   * @returns
   */
  getUpdatedOrderItem(
    voucher: Voucher,
    orderItem: OrderItem,
    isAddVoucher: boolean,
  ): OrderItem {
    const originalSubtotal = orderItem.quantity * orderItem.variant.price;

    // default
    orderItem.voucherValue = 0;
    orderItem.discountType = DiscountType.NONE;

    if (isAddVoucher) {
      let appliedVoucher: Voucher = null;
      const voucherProduct = voucher?.voucherProducts.find(
        (voucherProduct) =>
          voucherProduct.product.id === orderItem.variant.product.id,
      );
      if (voucherProduct) {
        appliedVoucher = voucher;
      }

      // add voucher
      const { subtotal, voucherValue } = this.calculateSubTotal(
        orderItem,
        orderItem.promotion,
        appliedVoucher,
      );
      Object.assign(orderItem, {
        subtotal,
        originalSubtotal,
      });
      if (orderItem.promotion) {
        orderItem.voucherValue = 0;
        orderItem.discountType = DiscountType.PROMOTION;
      }
      if (appliedVoucher?.type === VoucherType.SAME_PRICE_PRODUCT) {
        orderItem.voucherValue = voucherValue;
        orderItem.discountType = DiscountType.VOUCHER;
      }
    } else {
      // remove voucher
      const { subtotal } = this.calculateSubTotal(
        orderItem,
        orderItem.promotion,
        null,
      );
      Object.assign(orderItem, {
        subtotal,
        originalSubtotal,
      });
      if (orderItem.promotion) {
        orderItem.voucherValue = 0;
        orderItem.discountType = DiscountType.PROMOTION;
      }
    }

    return orderItem;
  }
}
