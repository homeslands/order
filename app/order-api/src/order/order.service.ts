import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import {
  FindManyOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm';
import {
  CreateOrderRequestDto,
  GetOrderRequestDto,
  OrderResponseDto,
  UpdateOrderRequestDto,
} from './order.dto';
import { OrderItem } from 'src/order-item/order-item.entity';
import {
  CreateOrderItemRequestDto,
  OrderItemResponseDto,
  StatusOrderItemResponseDto,
} from 'src/order-item/order-item.dto';
import { Table } from 'src/table/table.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { OrderType } from './order.constants';
import { WorkflowStatus } from 'src/tracking/tracking.constants';
import { OrderException } from './order.exception';
import { OrderValidation } from './order.validation';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { Menu } from 'src/menu/menu.entity';
import moment from 'moment';
import * as _ from 'lodash';
import { OrderScheduler } from './order.scheduler';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { OrderUtils } from './order.utils';
import { BranchUtils } from 'src/branch/branch.utils';
import { TableUtils } from 'src/table/table.utils';
import { UserUtils } from 'src/user/user.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { VariantUtils } from 'src/variant/variant.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { Voucher } from 'src/voucher/voucher.entity';
import { OrderItemUtils } from 'src/order-item/order-item.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { MenuItemValidation } from 'src/menu-item/menu-item.validation';
import { MenuItemException } from 'src/menu-item/menu-item.exception';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly orderScheduler: OrderScheduler,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly orderUtils: OrderUtils,
    private readonly branchUtils: BranchUtils,
    private readonly tableUtils: TableUtils,
    private readonly userUtils: UserUtils,
    private readonly menuItemUtils: MenuItemUtils,
    private readonly variantUtils: VariantUtils,
    private readonly menuUtils: MenuUtils,
    private readonly voucherUtils: VoucherUtils,
    private readonly orderItemUtils: OrderItemUtils,
    private readonly promotionUtils: PromotionUtils,
  ) {}

  /**
   * Delete order
   * @param {string} slug
   * @returns {Promise<void>} The deleted order
   */
  async deleteOrder(slug: string): Promise<Order> {
    return await this.orderUtils.deleteOrder(slug); // Delete order immediately
  }

  /**
   * Handles order updating
   * @param {string} slug
   * @param {UpdateOrderRequestDto} requestData The data to update order
   * @returns {Promise<OrderResponseDto>} The updated order
   * @throws {OrderException} If order is not found
   */
  async updateOrder(
    slug: string,
    requestData: UpdateOrderRequestDto,
  ): Promise<OrderResponseDto> {
    const context = `${OrderService.name}.${this.updateOrder.name}`;

    const order = await this.orderUtils.getOrder({ where: { slug } });

    const table =
      requestData.type === OrderType.AT_TABLE
        ? await this.tableUtils.getTable({
            where: {
              slug: requestData.table,
            },
          })
        : null;
    order.type = requestData.type;
    order.table = table;

    // Get new voucher
    let voucher: Voucher = null;
    if (requestData.voucher) {
      voucher = await this.voucherUtils.getVoucher({
        where: {
          slug: requestData.voucher ?? IsNull(),
        },
      });
      await this.voucherUtils.validateVoucher(voucher);
      await this.voucherUtils.validateVoucherUsage(voucher, order.owner.slug);
      await this.voucherUtils.validateMinOrderValue(voucher, order);
    }

    // Get previous voucher
    const previousVoucher = order.voucher;

    // Update order
    const updatedOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        if (voucher) {
          // Update remaining quantity of voucher
          voucher.remainingUsage -= 1;

          // Update order
          order.voucher = voucher;
          order.subtotal = await this.orderUtils.getOrderSubtotal(
            order,
            voucher,
          );

          await manager.save(voucher);
        }

        if (previousVoucher) {
          previousVoucher.remainingUsage += 1;
          await manager.save(previousVoucher);
        }

        return await manager.save(order);
      },
      (result) => {
        this.logger.log(`Order ${result.slug} updated successfully`, context);
      },
      (error) => {
        this.logger.warn(
          `Error when updating order: ${error.message}`,
          context,
        );
        throw new OrderException(
          OrderValidation.UPDATE_ORDER_ERROR,
          error.message,
        );
      },
    );

    return this.mapper.map(updatedOrder, Order, OrderResponseDto);
  }

  /**
   * Handles order creation
   * This method creates new order and order items
   * @param {CreateOrderRequestDto} requestData The data to create a new order
   * @returns {Promise<OrderResponseDto>} The created order
   * @throws {BranchException} If branch is not found
   * @throws {TableException} If table is not found in this branch
   * @throws {OrderException} If invalid data to create order item
   */
  async createOrder(
    requestData: CreateOrderRequestDto,
  ): Promise<OrderResponseDto> {
    const context = `${OrderService.name}.${this.createOrder.name}`;

    // Construct order
    const order: Order = await this.constructOrder(requestData);

    // Get order items
    const orderItems = await this.constructOrderItems(
      requestData.branch,
      requestData.orderItems,
    );
    this.logger.log(`Number of order items: ${orderItems.length}`, context);
    order.orderItems = orderItems;

    // Get voucher
    let voucher: Voucher = null;
    try {
      voucher = await this.voucherUtils.getVoucher({
        where: {
          slug: requestData.voucher ?? IsNull(),
        },
      });
    } catch (error) {
      this.logger.warn(`${error.message}`, context);
    }

    if (voucher) {
      await this.voucherUtils.validateVoucher(voucher);
      await this.voucherUtils.validateVoucherUsage(voucher, requestData.owner);
      await this.voucherUtils.validateMinOrderValue(voucher, order);
      // Update remaining quantity of voucher
      voucher.remainingUsage -= 1;
    }

    order.voucher = voucher;
    order.subtotal = await this.orderUtils.getOrderSubtotal(order, voucher);

    const createdOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        const createdOrder = await manager.save(order);
        const currentMenuItems = await this.menuItemUtils.getCurrentMenuItems(
          createdOrder,
          new Date(moment().format('YYYY-MM-DD')),
          'decrement',
        );
        await manager.save(currentMenuItems);

        // Update remaining quantity of voucher
        if (voucher) await manager.save(voucher);

        this.logger.log(
          `Number of menu items: ${currentMenuItems.length} updated successfully`,
          context,
        );

        // Cancel order after 10 minutes
        this.orderScheduler.handleDeleteOrder(
          createdOrder.slug,
          10 * 60 * 1000,
        );
        return createdOrder;
      },
      (result) => {
        this.logger.log(`Order ${result.slug} has been created`, context);
      },
      (error) => {
        this.logger.warn(
          `Error when creating new order: ${error.message}`,
          context,
        );
        throw new OrderException(OrderValidation.CREATE_ORDER_ERROR);
      },
    );

    return this.mapper.map(createdOrder, Order, OrderResponseDto);
  }

  /**
   *
   * @param {CreateOrderRequestDto} data The data to create order
   * @returns {Promise<Order>} The result of checking
   */
  async constructOrder(data: CreateOrderRequestDto): Promise<Order> {
    // Get branch
    const branch = await this.branchUtils.getBranch({
      where: { slug: data.branch },
    });

    // Get table if order type is at table
    let table: Table = null;
    if (data.type === OrderType.AT_TABLE) {
      table = await this.tableUtils.getTable({
        where: {
          slug: data.table,
          branch: {
            id: branch.id,
          },
        },
      });
    }

    // Get owner
    const owner = await this.userUtils.getUser({
      where: { slug: data.owner },
    });

    // Get cashier
    const approvalBy = await this.userUtils.getUser({
      where: {
        slug: data.approvalBy,
      },
    });

    const order = this.mapper.map(data, CreateOrderRequestDto, Order);
    Object.assign(order, {
      owner,
      branch,
      table,
      approvalBy,
    });
    return order;
  }

  /**
   *
   * @param {CreateOrderItemRequestDto} createOrderItemRequestDtos The array of data to create order item
   * @returns {Promise<ConstructOrderItemResponseDto>} The result of checking
   */
  async constructOrderItems(
    branch: string,
    createOrderItemRequestDtos: CreateOrderItemRequestDto[],
  ): Promise<OrderItem[]> {
    // Get menu
    const menu = await this.menuUtils.getMenu({
      where: {
        branch: {
          slug: branch,
        },
        date: new Date(moment().format('YYYY-MM-DD')),
      },
    });

    return await Promise.all(
      createOrderItemRequestDtos.map(
        async (item) => await this.constructOrderItem(item, menu),
      ),
    );
  }

  async constructOrderItem(
    item: CreateOrderItemRequestDto,
    menu: Menu,
  ): Promise<OrderItem> {
    const context = `${OrderService.name}.${this.constructOrderItem.name}`;
    // Get variant
    const variant = await this.variantUtils.getVariant({
      where: {
        slug: item.variant,
      },
    });

    // Get menu item
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
    //  limit product
    if (item.quantity === Infinity) {
      this.logger.warn(
        OrderValidation.REQUEST_QUANTITY_MUST_OTHER_INFINITY.message,
        context,
      );
      throw new OrderException(
        OrderValidation.REQUEST_QUANTITY_MUST_OTHER_INFINITY,
      );
    }
    if (menuItem.defaultStock !== null) {
      if (item.quantity > menuItem.currentStock) {
        this.logger.warn(
          OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY.message,
          context,
        );
        throw new OrderException(
          OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY,
        );
      }
    }

    const promotion: Promotion = menuItem.promotion;
    await this.promotionUtils.validatePromotionWithMenuItem(
      item.promotion,
      menuItem,
    );

    const orderItem = this.mapper.map(
      item,
      CreateOrderItemRequestDto,
      OrderItem,
    );

    Object.assign(orderItem, {
      variant,
      promotion,
    });

    const subtotal = this.orderItemUtils.calculateSubTotal(
      orderItem,
      promotion,
    );

    Object.assign(orderItem, {
      subtotal,
    });
    return orderItem;
  }

  /**
   *
   * @param {GetOrderRequestDto} options The options to retrieved order
   * @returns {Promise<AppPaginatedResponseDto<OrderResponseDto>>} All orders retrieved
   */
  async getAllOrders(
    options: GetOrderRequestDto,
  ): Promise<AppPaginatedResponseDto<OrderResponseDto>> {
    const findOptionsWhere: FindOptionsWhere<Order> = {
      branch: {
        slug: options.branch,
      },
      owner: {
        slug: options.owner,
      },
      table: {
        slug: options.table,
      },
    };

    if (!_.isEmpty(options.status)) {
      findOptionsWhere.status = In(options.status);
    }

    const findManyOptions: FindManyOptions<Order> = {
      where: findOptionsWhere,
      relations: [
        'owner',
        'approvalBy',
        'orderItems.variant.size',
        'orderItems.variant.product',
        'payment',
        'invoice',
        'table',
        'orderItems.promotion',
        'chefOrders',
      ],
      order: { createdAt: 'DESC' },
    };

    if (options.hasPaging) {
      Object.assign(findManyOptions, {
        skip: (options.page - 1) * options.size,
        take: options.size,
      });
    }

    const [orders, total] =
      await this.orderRepository.findAndCount(findManyOptions);

    const ordersDto = this.mapper.mapArray(orders, Order, OrderResponseDto);
    const page = options.hasPaging ? options.page : 1;
    const pageSize = options.hasPaging ? options.size : total;

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);
    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: ordersDto,
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<OrderResponseDto>;
  }

  /**
   *
   * @param {string} slug The slug of order retrieved
   * @returns {Promise<OrderResponseDto>} The order data is retrieved
   * @throws {OrderException} If order is not found
   */
  async getOrderBySlug(slug: string): Promise<OrderResponseDto> {
    const order = await this.orderUtils.getOrder({ where: { slug } });
    const orderDto = this.mapper.map(order, Order, OrderResponseDto);
    const orderItems = this.getOrderItemsStatuses(orderDto);
    orderDto.orderItems = orderItems;
    return orderDto;
  }

  /**
   * Assign status synthesis for each order item in order
   * @param {Order} order The order data relates to tracking
   * @returns {Promise<OrderResponseDto>} The order data with order item have status synthesis
   */
  getOrderItemsStatuses(order: OrderResponseDto): OrderItemResponseDto[] {
    const orderItems = order.orderItems.map((item) => {
      const statusQuantities = item.trackingOrderItems.reduce(
        (acc, trackingItem) => {
          const status = trackingItem.tracking.status;
          acc[status] += trackingItem.quantity;
          return acc;
        },
        {
          [WorkflowStatus.PENDING]: 0,
          [WorkflowStatus.RUNNING]: 0,
          [WorkflowStatus.COMPLETED]: 0,
          [WorkflowStatus.FAILED]: 0,
        } as StatusOrderItemResponseDto,
      );
      return {
        ...item,
        status: statusQuantities,
      } as OrderItemResponseDto;
    });
    return orderItems;
  }
}
