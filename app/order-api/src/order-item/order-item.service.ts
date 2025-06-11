import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderItem } from './order-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateOrderItemRequestDto,
  OrderItemResponseDto,
  updateOrderItemNoteRequestDto,
  UpdateOrderItemRequestDto,
} from './order-item.dto';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { OrderUtils } from 'src/order/order.utils';
import { OrderItemUtils } from './order-item.utils';
import { VariantUtils } from 'src/variant/variant.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import moment from 'moment';
import { OrderItemException } from './order-item.exception';
import { OrderItemValidation } from './order-item.validation';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { Order } from 'src/order/order.entity';
import _ from 'lodash';
import { OrderScheduler } from 'src/order/order.scheduler';
import { OrderException } from 'src/order/order.exception';
import { OrderValidation } from 'src/order/order.validation';
import { MenuItemValidation } from 'src/menu-item/menu-item.validation';
import { MenuItemException } from 'src/menu-item/menu-item.exception';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { Voucher } from 'src/voucher/voucher.entity';
import { DiscountType } from 'src/order/order.constants';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderItemService {
  constructor(
    private readonly orderItemUtils: OrderItemUtils,
    private readonly variantUtils: VariantUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly orderUtils: OrderUtils,
    private readonly menuItemUtils: MenuItemUtils,
    private readonly promotionUtils: PromotionUtils,
    private readonly menuUtils: MenuUtils,
    private readonly orderScheduler: OrderScheduler,
    private readonly voucherUtils: VoucherUtils,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async updateDiscountTypeForExistedOrderItem() {
    const context = `${OrderItemService.name}.${this.updateDiscountTypeForExistedOrderItem.name}`;
    const batchSize = 500;
    let offset = 0;
    let totalUpdated = 0;

    while (true) {
      const batch = await this.orderItemRepository.find({
        where: { discountType: DiscountType.NONE },
        relations: ['promotion'],
        take: batchSize,
        skip: offset,
        order: { id: 'ASC' },
      });

      if (batch.length === 0) break;

      const updatedBatch: OrderItem[] = [];
      for (const item of batch) {
        if (item.promotion) {
          item.discountType = DiscountType.PROMOTION;
          updatedBatch.push(item);
        }
      }

      await this.transactionManagerService.execute<void>(
        async (manager) => {
          await manager.save(updatedBatch);
        },
        () => {
          this.logger.log(
            `Processed batch from offset ${offset}, updated ${updatedBatch.length} items.`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error updating batch at offset ${offset}: ${error.message}`,
            context,
          );
        },
      );

      totalUpdated += updatedBatch.length;
      offset += batchSize;
    }
    this.logger.log(
      `Finished updating total ${totalUpdated} invoice items.`,
      context,
    );
  }

  /**
   * Handles order item note update
   * @param {string} slug
   * @param {updateOrderItemNoteRequestDto} requestData
   * @returns {Promise<OrderItemResponseDto>} Result when updating order item note
   * @throws {OrderItemException} Error when updating order item note error
   *
   */
  async updateOrderItemNote(
    slug: string,
    requestData: updateOrderItemNoteRequestDto,
  ): Promise<OrderItemResponseDto> {
    const context = `${OrderItemService.name}.${this.updateOrderItemNote.name}`;
    const orderItem = await this.orderItemUtils.getOrderItem({
      where: { slug },
    });

    orderItem.note = requestData.note;

    const updatedOrderItem =
      await this.transactionManagerService.execute<OrderItem>(
        async (manager) => {
          return await manager.save(orderItem);
        },
        (result) => {
          this.logger.log(
            `Order item note updated: ${result.variant?.product?.name}`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error when updating order item note: ${error.message}`,
            error.stack,
            context,
          );
          throw new OrderItemException(
            OrderItemValidation.UPDATE_ORDER_ITEM_ERROR,
          );
        },
      );

    return this.mapper.map(updatedOrderItem, OrderItem, OrderItemResponseDto);
  }

  /**
   * Handles order item update
   * @param {string} slug
   * @param {UpdateOrderItemRequestDto} requestData
   * @returns {Promise<OrderItemResponseDto>} Result when updating order item
   * @throws {OrderItemException} Error when updating order item error
   * @throws {OrderException} Error when updating order error
   */
  async updateOrderItem(
    slug: string,
    requestData: UpdateOrderItemRequestDto,
  ): Promise<OrderItemResponseDto> {
    const context = `${OrderItemService.name}.${this.updateOrderItem.name}`;

    if (requestData.quantity === Infinity) {
      this.logger.warn(
        OrderValidation.REQUEST_QUANTITY_MUST_OTHER_INFINITY.message,
        context,
      );
      throw new OrderException(
        OrderValidation.REQUEST_QUANTITY_MUST_OTHER_INFINITY,
      );
    }

    if (!requestData.action) {
      this.logger.warn('Action is required', context);
      throw new OrderItemException(OrderItemValidation.INVALID_ACTION);
    }

    let orderItem = await this.orderItemUtils.getOrderItem({
      where: { slug },
    });

    if (!orderItem.order) {
      this.logger.warn('Order item not found', context);
      throw new OrderItemException(OrderItemValidation.ORDER_ITEM_NOT_FOUND);
    }

    // Đổi variant => đổi size trong cùng sản phẩm đó
    // => Không cần check lại voucher có hiệu lực cho sản phẩm hay không
    const variant = await this.variantUtils.getVariant({
      where: { slug: requestData.variant },
    });

    // # Check promotion
    const date = new Date(orderItem.order.createdAt);
    date.setHours(7, 0, 0, 0);

    const menu = await this.menuUtils.getMenu({
      where: {
        branch: { id: orderItem.order?.branch?.id },
        date,
      },
    });

    const menuItem = await this.menuItemUtils.getMenuItem({
      where: {
        menu: { slug: menu.slug },
        product: {
          id: variant.product?.id,
        },
      },
      relations: ['promotion'],
    });
    if (menuItem.isLocked) {
      this.logger.warn(MenuItemValidation.MENU_ITEM_IS_LOCKED.message, context);
      throw new MenuItemException(MenuItemValidation.MENU_ITEM_IS_LOCKED);
    }

    await this.promotionUtils.validatePromotionWithMenuItem(
      requestData.promotion,
      menuItem,
    );

    orderItem.variant = variant;
    orderItem.quantity = requestData.quantity;
    orderItem.promotion = menuItem.promotion;
    // const { subtotal: subtotalOrderItem, voucherValue } =
    //   this.orderItemUtils.calculateSubTotal(
    //     orderItem,
    //     menuItem.promotion,
    //     orderItem.order?.voucher,
    //   );
    // orderItem.subtotal = subtotalOrderItem;
    // orderItem.voucherValue = voucherValue;

    //update: subtotal, voucherValue, discountType, originalSubtotal
    orderItem = this.orderItemUtils.getUpdatedOrderItem(
      orderItem.order?.voucher,
      orderItem,
      true, // isAddVoucher
    );

    if (requestData.note) orderItem.note = requestData.note;

    const updatedOrderItem =
      await this.transactionManagerService.execute<OrderItem>(
        async (manager) => {
          // Update order item
          const updatedOrderItem = await manager.save(orderItem);

          // Update menu item
          const menuItem = await this.menuItemUtils.getCurrentMenuItem(
            orderItem,
            date,
            // If when increment order item, we need to decrement menu item
            requestData.action === 'increment' ? 'decrement' : 'increment',
          );
          await manager.save(menuItem);
          return updatedOrderItem;
        },
        (result) => {
          this.logger.log(
            `Order item updated: ${result.variant?.product?.name}`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error when updating order item: ${error.message}`,
            error.stack,
            context,
          );
          throw new OrderItemException(
            OrderItemValidation.UPDATE_ORDER_ITEM_ERROR,
          );
        },
      );

    // Update order subtotal
    const order = await this.orderUtils.getOrder({
      where: {
        id: orderItem.order.id,
      },
    });

    const voucher: Voucher = order.voucher;
    if (voucher) {
      const isVoucherValid =
        await this.voucherUtils.validateMinOrderValueForUpdateOrderItem(
          voucher,
          order,
        );
      if (!isVoucherValid) {
        voucher.remainingUsage += 1;
        order.voucher = null;
      }
    }

    const { subtotal: subtotalOrder } = await this.orderUtils.getOrderSubtotal(
      order,
      order.voucher,
    );
    order.subtotal = subtotalOrder;
    await this.transactionManagerService.execute(
      async (manager) => {
        if (voucher) await manager.save(voucher);
        await manager.save(order);
      },
      () => {
        this.logger.log(`Order updated: ${order.slug}`, context);
      },
      (error) => {
        this.logger.error(
          `Error when updating order: ${error.message}`,
          error.stack,
          context,
        );
        throw new OrderException(
          OrderValidation.UPDATE_ORDER_ERROR,
          error.message,
        );
      },
    );
    return this.mapper.map(updatedOrderItem, OrderItem, OrderItemResponseDto);
  }

  /**
   * Handles order item deletion
   * @param {string} slug
   * @returns {Promise<void>} Result when deleting order item
   */
  async deleteOrderItem(slug: string): Promise<void> {
    const context = `${OrderItemService.name}.${this.deleteOrderItem.name}`;
    const orderItem = await this.orderItemUtils.getOrderItem({
      where: { slug },
    });
    const { slug: orderSlug } = orderItem.order;
    const order = await this.orderUtils.getOrder({
      where: { slug: orderSlug },
    });

    const updatedOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        // Update menu items
        const menuItem = await this.menuItemUtils.getCurrentMenuItem(
          orderItem,
          new Date(moment().format('YYYY-MM-DD')),
          'increment',
          orderItem.quantity,
        );
        await manager.save(menuItem);

        // Remove order item
        // Can not use manager.remove(orderItem) because order item is not managed by manager
        // We get order item from order repository so we need to remove it from order item repository
        orderItem.order = null;
        order.orderItems = order.orderItems.filter(
          (item) => item.slug !== orderItem.slug,
        );
        await manager.softRemove(orderItem);

        // validate voucher
        const voucher: Voucher = order.voucher;
        if (voucher) {
          const isVoucherValid =
            await this.voucherUtils.validateMinOrderValueForUpdateOrderItem(
              voucher,
              order,
            );
          if (!isVoucherValid) {
            if (!_.isEmpty(order.orderItems)) {
              voucher.remainingUsage += 1;
              order.voucher = null;
            }
          }
        }
        // Update order
        const { subtotal: subtotalOrder } =
          await this.orderUtils.getOrderSubtotal(order, order.voucher);
        order.subtotal = subtotalOrder;

        if (voucher) await manager.save(voucher);

        return await manager.save(order);
      },
      () => {
        this.logger.log(`Order item deleted: ${slug}`, context);
      },
      (error) => {
        this.logger.error(
          `Error when deleting order item: ${error.message}`,
          error.stack,
          context,
        );
        throw new OrderItemException(
          OrderItemValidation.DELETE_ORDER_ITEM_ERROR,
        );
      },
    );

    // Delete order if no order items
    if (_.isEmpty(updatedOrder.orderItems)) {
      this.orderScheduler.handleDeleteOrder(orderSlug, 0);
    }
  }

  /**
   * Handles order item creation
   * @param {CreateOrderItemRequestDto} requestData
   * @returns {Promise<OrderItemResponseDto>} Result when creating order item
   */
  async createOrderItem(
    requestData: CreateOrderItemRequestDto,
  ): Promise<OrderItemResponseDto> {
    const context = `${OrderItemService.name}.${this.createOrderItem.name}`;
    const order = await this.orderUtils.getOrder({
      where: {
        slug: requestData.order,
      },
    });

    if (order.voucher) {
      await this.voucherUtils.validateVoucherProduct(order.voucher, [
        requestData.variant,
      ]);
    }

    if (requestData.quantity === Infinity) {
      this.logger.warn(
        OrderValidation.REQUEST_QUANTITY_MUST_OTHER_INFINITY.message,
        context,
      );
      throw new OrderException(
        OrderValidation.REQUEST_QUANTITY_MUST_OTHER_INFINITY,
      );
    }

    const variant = await this.variantUtils.getVariant({
      where: {
        slug: requestData.variant,
      },
    });

    // # Check promotion
    const date = new Date(order.createdAt);
    date.setHours(7, 0, 0, 0);

    const menu = await this.menuUtils.getMenu({
      where: {
        branch: { id: order.branch.id },
        date,
      },
    });

    const menuItem = await this.menuItemUtils.getMenuItem({
      where: {
        menu: { slug: menu.slug },
        product: {
          id: variant.product?.id,
        },
      },
      relations: ['promotion'],
    });
    if (menuItem.isLocked) {
      this.logger.warn(MenuItemValidation.MENU_ITEM_IS_LOCKED.message, context);
      throw new MenuItemException(MenuItemValidation.MENU_ITEM_IS_LOCKED);
    }

    await this.promotionUtils.validatePromotionWithMenuItem(
      requestData.promotion,
      menuItem,
    );

    let orderItem = this.mapper.map(
      requestData,
      CreateOrderItemRequestDto,
      OrderItem,
    );
    orderItem.variant = variant;
    orderItem.order = order;
    orderItem.promotion = menuItem.promotion;
    // const { subtotal, voucherValue } = this.orderItemUtils.calculateSubTotal(
    //   orderItem,
    //   menuItem.promotion,
    //   order.voucher,
    // );
    // orderItem.subtotal = subtotal;
    // orderItem.voucherValue = voucherValue;

    //add: subtotal, voucherValue, discountType, originalSubtotal
    orderItem = this.orderItemUtils.getUpdatedOrderItem(
      order.voucher,
      orderItem,
      true, // isAddVoucher
    );

    // Update order
    order.orderItems.push(orderItem);
    const { subtotal: subtotalOrder } = await this.orderUtils.getOrderSubtotal(
      order,
      order.voucher,
    );
    order.subtotal = subtotalOrder;

    const createdOrderItem =
      await this.transactionManagerService.execute<OrderItem>(
        async (manager) => {
          // Create order item
          const created = await manager.save(orderItem);

          // Update menu items
          const menuItem = await this.menuItemUtils.getCurrentMenuItem(
            orderItem,
            date,
            'decrement',
          );
          await manager.save(menuItem);

          // Update order
          await manager.save(order);

          return created;
        },
        (result) => {
          this.logger.log(`Order item created: ${result.id}`, context);
        },
        (error) => {
          this.logger.error(
            `Error when creating order item: ${error.mesage}`,
            error.stack,
            context,
          );
          throw new OrderItemException(
            OrderItemValidation.CREATE_ORDER_ITEM_ERROR,
          );
        },
      );

    return this.mapper.map(createdOrderItem, OrderItem, OrderItemResponseDto);
  }
}
