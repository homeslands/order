import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { OrderItemException } from './order-item.exception';
import { OrderItemValidation } from './order-item.validation';
import { Promotion } from 'src/promotion/promotion.entity';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import {
  VoucherApplicabilityRule,
  VoucherType,
} from 'src/voucher/voucher.constant';
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
    const originalSubtotal = orderItem.variant.price * orderItem.quantity;
    let voucherValue = 0;
    if (promotion) {
      const percentPromotion = promotion.value;
      discountPromotion = (originalSubtotal * percentPromotion) / 100;
    }

    if (voucher) {
      if (
        voucher.applicabilityRule ===
        VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED
      ) {
        switch (voucher.type) {
          case VoucherType.SAME_PRICE_PRODUCT:
            const sameProductValueTotal = voucher.value * orderItem.quantity;
            if (originalSubtotal > sameProductValueTotal) {
              voucherValue = originalSubtotal - sameProductValueTotal;
              return {
                subtotal: sameProductValueTotal,
                voucherValue,
              };
            } else {
              // voucher value is greater than variant price
              // use price of variant
              return {
                subtotal: originalSubtotal,
                voucherValue: 0,
              };
            }

          case VoucherType.PERCENT_ORDER:
            voucherValue = (originalSubtotal * voucher.value) / 100;
            return {
              subtotal: originalSubtotal - voucherValue,
              voucherValue,
            };
          case VoucherType.FIXED_VALUE:
            voucherValue = voucher.value * orderItem.quantity;
            if (originalSubtotal > voucherValue) {
              return {
                subtotal: originalSubtotal - voucherValue,
                voucherValue,
              };
            } else {
              return {
                subtotal: 0,
                voucherValue: originalSubtotal,
              };
            }

          default:
            break;
        }
      } else if (
        voucher.applicabilityRule === VoucherApplicabilityRule.ALL_REQUIRED
      ) {
        switch (voucher.type) {
          case VoucherType.SAME_PRICE_PRODUCT:
            const sameProductValueTotal = voucher.value * orderItem.quantity;
            if (originalSubtotal > sameProductValueTotal) {
              voucherValue = originalSubtotal - sameProductValueTotal;
              return {
                subtotal: sameProductValueTotal,
                voucherValue,
              };
            } else {
              // voucher value is greater than variant price
              // use price of variant
              return {
                subtotal: originalSubtotal,
                voucherValue: 0,
              };
            }

          default:
            // Calculate voucher value base on subtotal order with voucher type (amount, percentage)
            break;
        }
      }
    }

    return {
      subtotal: originalSubtotal - discountPromotion,
      voucherValue: 0,
    };
  }

  /**
   * Calculate the subtotal cost of an order item.
   * @param orderItem order item.
   * @returns the subtotal cost of an order item.
   */
  calculateSubTotalCost(orderItem: OrderItem): number {
    return orderItem.variant.costPrice * orderItem.quantity;
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
      if (
        appliedVoucher?.applicabilityRule ===
        VoucherApplicabilityRule.ALL_REQUIRED
      ) {
        if (appliedVoucher?.type === VoucherType.SAME_PRICE_PRODUCT) {
          orderItem.voucherValue = voucherValue;
          orderItem.discountType = DiscountType.VOUCHER;
        }
      }

      if (
        appliedVoucher?.applicabilityRule ===
        VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED
      ) {
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
