import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import {
  CreateOrderRequestDto,
  GetOrderRequestDto,
  OrderResponseDto,
} from './order.dto';
import { OrderItem } from 'src/order-item/order-item.entity';
import { CreateOrderItemRequestDto } from 'src/order-item/order-item.dto';
import { Table } from 'src/table/table.entity';
import { Branch } from 'src/branch/branch.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { User } from 'src/user/user.entity';
import { Variant } from 'src/variant/variant.entity';
import { OrderStatus, OrderType } from './order.contants';
import { WorkflowStatus } from 'src/tracking/tracking.constants';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderException } from './order.exception';
import { OrderValidation } from './order.validation';
import { BranchValidation } from 'src/branch/branch.validation';
import { TableException } from 'src/table/table.exception';
import { TableValidation } from 'src/table/table.validation';
import { VariantException } from 'src/variant/variant.exception';
import { VariantValidation } from 'src/variant/variant.validation';
import { PaymentAction, PaymentStatus } from 'src/payment/payment.constants';
import { BranchException } from 'src/branch/branch.exception';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { Menu } from 'src/menu/menu.entity';
import { MenuValidation } from 'src/menu/menu.validation';
import { MenuException } from 'src/menu/menu.exception';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import ProductValidation from 'src/product/product.validation';
import { ProductException } from 'src/product/product.exception';
import moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly dataSource: DataSource,
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
    const order = await this.orderRepository.findOne({
      where: { id: requestData.orderId },
      relations: ['payment'],
    });

    if (!order) {
      this.logger.error(`Order not found`, null, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }
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
   * Handles create new order
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

    const order: Order = await this.constructOrder(requestData);
    let createdOrder: Order;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Created order
      createdOrder = await queryRunner.manager.save(order);
      // Update current stock of menu items
      const currentMenuItems = await this.getCurrentMenuItems(createdOrder);
      await queryRunner.manager.save(currentMenuItems);

      await queryRunner.commitTransaction();

      this.logger.log(
        `New order ${createdOrder.slug} created successfully`,
        context,
      );
      this.logger.log(
        `Number of menu items: ${currentMenuItems.length} updated successfully`,
        context,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.warn(
        `Error when creating new order: ${err.message}`,
        context,
      );
      throw new OrderException(OrderValidation.CREATE_ORDER_ERROR);
    } finally {
      await queryRunner.release();
    }

    return this.mapper.map(createdOrder, Order, OrderResponseDto);
  }

  /**
   *
   * @param {CreateOrderRequestDto} data The data to create order
   * @returns {Promise<Order>} The result of checking
   */
  async constructOrder(data: CreateOrderRequestDto): Promise<Order> {
    const context = `${OrderService.name}.${this.constructOrder.name}`;
    // Get branch
    const branch = await this.branchRepository.findOneBy({ slug: data.branch });
    if (!branch) {
      this.logger.warn(
        `${BranchValidation.BRANCH_NOT_FOUND.message} ${data.branch}`,
        context,
      );
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    // Get table if order type is at table
    let table: Table = null;
    if (data.type === OrderType.AT_TABLE) {
      table = await this.tableRepository.findOne({
        where: {
          slug: data.table,
          branch: {
            slug: data.branch,
          },
        },
      });
      if (!table) {
        this.logger.warn(
          `${TableValidation.TABLE_NOT_FOUND.message} ${data.table}`,
          context,
        );
        throw new TableException(TableValidation.TABLE_NOT_FOUND);
      }
    }

    // Get owner
    const owner = await this.userRepository.findOneBy({ slug: data.owner });
    if (!owner) {
      this.logger.warn(
        `${OrderValidation.OWNER_NOT_FOUND.message} ${data.owner}`,
        context,
      );
      throw new OrderException(OrderValidation.OWNER_NOT_FOUND);
    }

    // Get cashier
    const approvalBy = await this.userRepository.findOne({
      where: {
        slug: data.approvalBy,
      },
    });
    if (!approvalBy) {
      this.logger.warn(`Approval ${data.approvalBy} is not found`, context);
    }

    // Get order items
    const orderItems = await this.constructOrderItem(
      data.branch,
      data.orderItems,
    );
    this.logger.log(`Number of order items: ${orderItems.length}`, context);

    // Get subtotal
    const subtotal = await this.getOrderSubtotal(orderItems);

    const order = this.mapper.map(data, CreateOrderRequestDto, Order);
    Object.assign(order, {
      owner,
      branch,
      table,
      approvalBy,
      orderItems,
      subtotal,
    });
    return order;
  }

  /**
   * Get list of current menu items
   * @param {Order} entity
   * @returns {Promise<MenuItem[]>} List of current menu items
   */
  async getCurrentMenuItems(entity: Order): Promise<MenuItem[]> {
    const context = `${OrderService.name}.${this.getCurrentMenuItems.name}`;
    this.logger.log(
      `Get current of menu items for order: ${entity.slug}`,
      context,
    );

    const today = new Date(moment().format('YYYY-MM-DD'));
    this.logger.log(`Retrieve the menu for today: ${today}`, context);

    // Get current menu
    const menu = await this.menuRepository.findOne({
      where: {
        branch: {
          id: entity.branch?.id,
        },
        date: today,
      },
    });
    if (!menu) {
      this.logger.warn(MenuValidation.MENU_NOT_FOUND.message, context);
      throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    }

    const menuItems = await Promise.all(
      entity.orderItems.map(async (item) => {
        // Get variant
        const variant = await this.variantRepository.findOne({
          where: {
            slug: item.variant.slug,
          },
          relations: ['product'],
        });
        if (!variant) {
          this.logger.warn(
            `${VariantValidation.VARIANT_NOT_FOUND.message} ${item.variant}`,
            context,
          );
          throw new VariantException(VariantValidation.VARIANT_NOT_FOUND);
        }

        // Get menu item
        const menuItem = await this.menuItemRepository.findOne({
          where: {
            menu: { slug: menu.slug },
            product: {
              id: variant.product?.id,
            },
          },
        });
        if (!menuItem) {
          this.logger.warn(
            ProductValidation.PRODUCT_NOT_FOUND_IN_TODAY_MENU.message,
            context,
          );
          throw new ProductException(
            ProductValidation.PRODUCT_NOT_FOUND_IN_TODAY_MENU,
          );
        }

        if (item.quantity > menuItem.currentStock) {
          this.logger.warn(
            OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY.message,
            context,
          );
          throw new OrderException(
            OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY,
          );
        }

        const currentQuantity: number = menuItem.currentStock - item.quantity;
        menuItem.currentStock = currentQuantity;
        return menuItem;
      }),
    );

    this.logger.log(`Number of menu items: ${menuItems.length}`, context);
    return menuItems;
  }

  /**
   *
   * @param {CreateOrderItemRequestDto} createOrderItemRequestDto The array of data to create order item
   * @returns {Promise<ConstructOrderItemResponseDto>} The result of checking
   */
  async constructOrderItem(
    branch: string,
    createOrderItemRequestDto: CreateOrderItemRequestDto[],
  ): Promise<OrderItem[]> {
    const context = `${OrderService.name}.${this.constructOrderItem.name}`;
    const today = new Date(moment().format('YYYY-MM-DD'));
    this.logger.log(`Retrieve the menu for today: ${today}`, context);

    // Get current menu
    const menu = await this.menuRepository.findOne({
      where: {
        branch: {
          slug: branch,
        },
        date: today,
      },
    });
    if (!menu) {
      this.logger.warn(MenuValidation.MENU_NOT_FOUND.message, context);
      throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    }

    const orderItems: OrderItem[] = [];
    for (const item of createOrderItemRequestDto) {
      // Get variant
      const variant = await this.variantRepository.findOne({
        where: {
          slug: item.variant,
        },
        relations: ['product'],
      });
      if (!variant) {
        this.logger.warn(
          `${VariantValidation.VARIANT_NOT_FOUND.message} ${item.variant}`,
          context,
        );
        throw new VariantException(VariantValidation.VARIANT_NOT_FOUND);
      }

      // Get menu item
      const menuItem = await this.menuItemRepository.findOne({
        where: {
          menu: { slug: menu.slug },
          product: {
            id: variant.product?.id,
          },
        },
      });
      if (!menuItem) {
        this.logger.warn(
          ProductValidation.PRODUCT_NOT_FOUND_IN_TODAY_MENU.message,
          context,
        );
        throw new ProductException(
          ProductValidation.PRODUCT_NOT_FOUND_IN_TODAY_MENU,
        );
      }

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
      orderItems.push(orderItem);
    }

    return orderItems;
  }

  /**
   * Calculate the subtotal of an order.
   * @param {OrderItem[]} orderItems Array of order items.
   * @returns {Promise<number>} The subtotal of order
   */
  private async getOrderSubtotal(orderItems: OrderItem[]): Promise<number> {
    return orderItems.reduce(
      (previous, current) => previous + current.subtotal,
      0,
    );
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
    const context = `${OrderService.name}.${this.getOrderBySlug.name}`;
    const order = await this.orderRepository.findOne({
      where: { slug },
      relations: [
        'payment',
        'owner',
        'orderItems.variant.size',
        'orderItems.variant.product',
        'orderItems.trackingOrderItems.tracking',
        'invoice.invoiceItems',
        'table',
      ],
    });

    if (!order) {
      this.logger.warn(
        `${OrderValidation.ORDER_NOT_FOUND.message} ${slug}`,
        context,
      );
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }

    const orderDto = this.getStatusEachOrderItemInOrder(order);
    return orderDto;
  }

  /**
   * Assign status synthesis for each order item in order
   * @param {Order} order The order data relates to tracking
   * @returns {Promise<OrderResponseDto>} The order data with order item have status synthesis
   */
  getStatusEachOrderItemInOrder(order: Order): OrderResponseDto {
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
        },
      );

      return {
        ...item,
        status: statusQuantities,
      };
    });
    const orderDto = this.mapper.map(order, Order, OrderResponseDto);
    Object.assign(orderDto, { orderItems });
    return orderDto;
  }
}
