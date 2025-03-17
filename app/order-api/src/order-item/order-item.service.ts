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
  ) {}

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

    const orderItem = await this.orderItemUtils.getOrderItem({
      where: { slug },
    });
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

    await this.promotionUtils.validatePromotionWithMenuItem(
      requestData.promotion,
      menuItem,
    );

    orderItem.variant = variant;
    orderItem.quantity = requestData.quantity;
    orderItem.promotion = menuItem.promotion;
    orderItem.subtotal = this.orderItemUtils.calculateSubTotal(
      orderItem,
      menuItem.promotion,
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

    order.subtotal = await this.orderUtils.getOrderSubtotal(
      order,
      order.voucher,
    );
    await this.transactionManagerService.execute(
      async (manager) => {
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
        await manager.remove(OrderItem, orderItem);

        // Update order
        order.subtotal = await this.orderUtils.getOrderSubtotal(
          order,
          order.voucher,
        );
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

    await this.promotionUtils.validatePromotionWithMenuItem(
      requestData.promotion,
      menuItem,
    );

    const orderItem = this.mapper.map(
      requestData,
      CreateOrderItemRequestDto,
      OrderItem,
    );
    orderItem.variant = variant;
    orderItem.order = order;
    orderItem.promotion = menuItem.promotion;
    orderItem.subtotal = this.orderItemUtils.calculateSubTotal(
      orderItem,
      menuItem.promotion,
    );

    // Update order
    order.orderItems.push(orderItem);
    order.subtotal = await this.orderUtils.getOrderSubtotal(
      order,
      order.voucher,
    );

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
