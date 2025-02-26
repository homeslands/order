import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderItem } from './order-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateOrderItemRequestDto,
  OrderItemResponseDto,
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { MenuUtils } from 'src/menu/menu.utils';

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
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly promotionUtils: PromotionUtils,
    private readonly menuUtils: MenuUtils,
  ) {}

  async updateOrderItem(slug: string, requestData: UpdateOrderItemRequestDto) {
    const context = `${OrderItemService.name}.${this.updateOrderItem.name}`;

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
        branch: { id: orderItem.order.branch.id },
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
    orderItem.subtotal = this.orderItemUtils.calculateSubTotal(orderItem);
    if (requestData.note) orderItem.note = requestData.note;

    await this.transactionManagerService.execute(
      async (manager) => {
        // Update order item
        await manager.save(orderItem);

        // Update menu item
        const menuItem = await this.menuItemUtils.getCurrentMenuItem(
          orderItem,
          // new Date(moment().format('YYYY-MM-DD')),
          date,
          requestData.action,
        );
        await manager.save(menuItem);

        // Update order
        const { order } = orderItem;

        order.subtotal = await this.orderUtils.getOrderSubtotal(order);
        await manager.save(order);
      },
      () => {
        this.logger.log(`Order item updated: ${slug}`, context);
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

    await this.transactionManagerService.execute(
      async (manager) => {
        // Update menu items
        const menuItem = await this.menuItemUtils.getCurrentMenuItem(
          orderItem,
          new Date(moment().format('YYYY-MM-DD')),
          'increment',
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
        order.subtotal = await this.orderUtils.getOrderSubtotal(order);
        await manager.save(order);
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
  }

  /**
   * Handles order item creation
   * @param {CreateOrderItemRequestDto} requestData
   * @returns {Promise<OrderItemResponseDto>} Result when creating order item
   */
  async createOrderItem(
    requestData: CreateOrderItemRequestDto,
  ): Promise<OrderItemResponseDto> {
    // validate stock
    // validate promotion
    // validate voucher
    // # Time in createdDate of order;
    const context = `${OrderItemService.name}.${this.createOrderItem.name}`;
    const order = await this.orderUtils.getOrder({
      where: {
        slug: requestData.order,
      },
    });

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
    orderItem.subtotal = await this.orderItemUtils.calculateSubTotal(orderItem);

    // Update order
    order.orderItems.push(orderItem);
    order.subtotal = await this.orderUtils.getOrderSubtotal(order);

    const createdOrderItem =
      await this.transactionManagerService.execute<OrderItem>(
        async (manager) => {
          // Create order item
          const created = await manager.save(orderItem);

          // Update menu items
          const menuItem = await this.menuItemUtils.getCurrentMenuItem(
            orderItem,
            // new Date(moment().format('YYYY-MM-DD')),
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
