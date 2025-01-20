import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
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
import { OrderStatus, OrderType } from './order.contants';
import { WorkflowStatus } from 'src/tracking/tracking.constants';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderException } from './order.exception';
import { OrderValidation } from './order.validation';
import { PaymentAction, PaymentStatus } from 'src/payment/payment.constants';
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
  ) {}

  @OnEvent(PaymentAction.PAYMENT_PAID)
  async handleUpdateOrderStatus(requestData: { orderId: string }) {
    const context = `${OrderService.name}.${this.handleUpdateOrderStatus.name}`;
    this.logger.log(`Update order status after payment process`, context);

    if (_.isEmpty(requestData)) {
      this.logger.error(`Request data is empty`, null, context);
      throw new OrderException(OrderValidation.ORDER_ID_INVALID);
    }

    this.logger.log(`Request data: ${JSON.stringify(requestData)}`, context);
    const order = await this.orderUtils.getOrder({
      where: {
        id: requestData.orderId,
      },
    });

    this.logger.log(`Current order: ${JSON.stringify(order)}`, context);

    if (
      order.payment?.statusCode === PaymentStatus.COMPLETED &&
      order.status === OrderStatus.PENDING
    ) {
      Object.assign(order, { status: OrderStatus.PAID });
      await this.orderRepository.save(order);
      this.logger.log(`Update order status from PENDING to PAID`, context);
    }
  }

  /**
   * Delete order
   * @param {string} slug
   * @returns {Promise<void>} The deleted order
   */
  async deleteOrder(slug: string): Promise<void> {
    const context = `${OrderService.name}.${this.deleteOrder.name}`;
    this.orderScheduler.addCancelOrderJob(slug, 10000);
  }

  /**
   * Handles order updating
   * @param {string} slug
   */
  async updateOrder(slug: string, requestData: UpdateOrderRequestDto) {
    const context = `${OrderService.name}.${this.updateOrder.name}`;

    const order = await this.orderUtils.getOrder({ where: { slug } });

    const table =
      requestData.type === OrderType.AT_TABLE
        ? await this.tableUtils.getTable({
            slug: requestData.table,
          })
        : null;
    order.type = requestData.type;
    order.table = table;
    order.subtotal = await this.orderUtils.getOrderSubtotal(order);

    // Update order
    const updatedOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        const updatedOrder = await manager.save(order);
        return updatedOrder;
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
    order.subtotal = await this.orderUtils.getOrderSubtotal(order);

    const createdOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        const createdOrder = await manager.save(order);
        const currentMenuItems = await this.menuItemUtils.getCurrentMenuItems(
          createdOrder,
          new Date(moment().format('YYYY-MM-DD')),
          'decrement',
        );
        await manager.save(currentMenuItems);

        this.logger.log(
          `Number of menu items: ${currentMenuItems.length} updated successfully`,
          context,
        );

        // Cancel order after 5 minutes
        this.orderScheduler.addCancelOrderJob(createdOrder.slug, 60 * 1000);
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
    const branch = await this.branchUtils.getBranch({ slug: data.branch });

    // Get table if order type is at table
    let table: Table = null;
    if (data.type === OrderType.AT_TABLE) {
      table = await this.tableUtils.getTable({
        slug: data.table,
        branch: {
          id: branch.id,
        },
      });
    }

    // Get owner
    const owner = await this.userUtils.getUser({ slug: data.owner });

    // Get cashier
    const approvalBy = await this.userUtils.getUser({
      slug: data.approvalBy,
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
    });

    if (item.quantity > menuItem.currentStock) {
      this.logger.warn(
        OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY.message,
        context,
      );
      throw new OrderException(
        OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY,
      );
    }

    const orderItem = this.mapper.map(
      item,
      CreateOrderItemRequestDto,
      OrderItem,
    );
    Object.assign(orderItem, {
      variant,
      subtotal: variant.price * item.quantity,
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
    const findOptionsWhere: FindOptionsWhere<any> = {
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
