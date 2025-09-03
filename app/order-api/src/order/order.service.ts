import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import {
  Between,
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
  UpdateVoucherOrderRequestDto,
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
import { DiscountType, OrderStatus, OrderType } from './order.constants';
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
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { OrderItemUtils } from 'src/order-item/order-item.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { MenuItemValidation } from 'src/menu-item/menu-item.validation';
import { MenuItemException } from 'src/menu-item/menu-item.exception';
import { RoleEnum } from 'src/role/role.enum';
import { User } from 'src/user/user.entity';
import { PaymentUtils } from 'src/payment/payment.utils';
import {
  VoucherApplicabilityRule,
  VoucherType,
} from 'src/voucher/voucher.constant';
import { PrinterJob } from 'src/printer/entity/printer-job.entity';
import {
  PrinterJobStatus,
  PrinterJobType,
} from 'src/printer/printer.constants';
import { PrinterJobResponseDto } from 'src/printer/printer.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectMapper() private readonly mapper: Mapper,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PrinterJob)
    private readonly printerJobRepository: Repository<PrinterJob>,
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
    private readonly paymentUtils: PaymentUtils,
  ) {}

  /**
   * Delete order
   * @param {string} slug
   * @returns {Promise<void>} The deleted order
   */
  async deleteOrder(slug: string): Promise<Order> {
    return await this.handleDeleteOrder(slug); // Delete order immediately
  }

  async deleteOrderPublic(slug: string, orders: string[]): Promise<Order> {
    const context = `${OrderService.name}.${this.deleteOrderPublic.name}`;
    if (!orders.includes(slug)) {
      this.logger.warn(`Order ${slug} is not in the list`, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }
    return await this.handleDeleteOrder(slug); // Delete order immediately
  }

  async handleDeleteOrder(orderSlug: string) {
    const context = `${OrderUtils.name}.${this.deleteOrder.name}`;
    this.logger.log(`Cancel order ${orderSlug}`, context);

    const order = await this.orderRepository.findOne({
      where: {
        slug: orderSlug,
      },
      relations: [
        'payment',
        'owner',
        'approvalBy',
        'orderItems.chefOrderItems',
        'orderItems.variant.size',
        'orderItems.variant.product',
        'orderItems.promotion',
        'orderItems.trackingOrderItems.tracking',
        'invoice.invoiceItems',
        'table',
        'voucher',
        'branch',
        'chefOrders.chefOrderItems',
      ],
    });

    if (!order) {
      this.logger.warn(`Order ${orderSlug} not found`, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${orderSlug} is not pending`, context);
      throw new OrderException(OrderValidation.ORDER_IS_NOT_PENDING);
    }
    // Get all menu items base on unique products
    const orderDate = new Date(moment(order.createdAt).format('YYYY-MM-DD'));
    const menuItems = await this.menuItemUtils.getCurrentMenuItems(
      order,
      orderDate,
      'increment',
    );

    const { payment, table, voucher } = order;

    // Delete order
    const removedOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        // Update stock of menu items
        await manager.save(menuItems);
        this.logger.log(
          `Menu items: ${menuItems.map((item) => item.product.name).join(', ')} updated`,
          context,
        );

        // Remove order items
        if (order.orderItems) await manager.softRemove(order.orderItems);

        // Remove order
        const removedOrder = await manager.softRemove(order);

        // Remove payment
        if (payment) {
          // await manager.softRemove(payment);
          // this.logger.log(`Payment has been removed`, context);
          await this.paymentUtils.cancelPayment(payment.slug);
        }

        // Update table status if order is at table
        if (table) {
          table.status = 'available';
          await manager.save(table);
          this.logger.log(`Table ${table.name} is available`, context);
        }

        // Update voucher remaining quantity
        if (voucher) {
          voucher.remainingUsage += 1;
          await manager.save(voucher);
          this.logger.log(
            `Voucher ${voucher.code} remaining usage updated`,
            context,
          );
        }
        return removedOrder;
      },
      () => {
        this.logger.log(`Order ${orderSlug} has been canceled`, context);
      },
      (error) => {
        this.logger.error(
          `Error when cancel order ${orderSlug}: ${error.message}`,
          error.stack,
          context,
        );
        throw new OrderException(OrderValidation.ERROR_WHEN_CANCEL_ORDER);
      },
    );
    return removedOrder;
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

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${slug} is not pending`, context);
      throw new OrderException(OrderValidation.ORDER_IS_NOT_PENDING);
    }

    order.type = requestData.type;

    if (requestData.type === OrderType.AT_TABLE) {
      const table = await this.tableUtils.getTable({
        where: {
          slug: requestData.table ?? IsNull(),
        },
      });
      order.table = table;
    } else {
      order.table = null;
    }

    if (requestData.description) {
      order.description = requestData.description;
    }

    // Update order
    const updatedOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        return await manager.save(order);
      },
      (result) => {
        this.logger.log(
          `Order with slug ${result.slug} updated successfully`,
          context,
        );
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

  async updateVoucherOrder(
    slug: string,
    requestData: UpdateVoucherOrderRequestDto,
  ): Promise<OrderResponseDto> {
    const context = `${OrderService.name}.${this.updateOrder.name}`;

    const order = await this.orderUtils.getOrder({ where: { slug } });

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${slug} is not pending`, context);
      throw new OrderException(OrderValidation.ORDER_IS_NOT_PENDING);
    }

    // Get new voucher
    let voucher: Voucher = null;

    // Remove voucher from order
    const previousVoucher = order.voucher;

    // update order item => remove voucher value
    if (
      previousVoucher?.applicabilityRule ===
      VoucherApplicabilityRule.ALL_REQUIRED
    ) {
      if (previousVoucher?.type === VoucherType.SAME_PRICE_PRODUCT) {
        const updatedOrderItems = order.orderItems.map((orderItem) => {
          const updatedOrderItem = this.orderItemUtils.getUpdatedOrderItem(
            null,
            orderItem,
            false, // is add voucher
          );
          return updatedOrderItem;
        });
        order.orderItems = updatedOrderItems;
      }
    }

    if (
      previousVoucher?.applicabilityRule ===
      VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED
    ) {
      const updatedOrderItems = order.orderItems.map((orderItem) => {
        const updatedOrderItem = this.orderItemUtils.getUpdatedOrderItem(
          null,
          orderItem,
          false, // is add voucher
        );
        return updatedOrderItem;
      });
      order.orderItems = updatedOrderItems;
    }

    order.voucher = null;
    const { subtotal, originalSubtotal } =
      await this.orderUtils.getOrderSubtotal(order, null);

    order.subtotal = subtotal;
    order.originalSubtotal = originalSubtotal;

    // Validate new voucher
    if (requestData.voucher) {
      voucher = await this.voucherUtils.getVoucher({
        where: {
          slug: requestData.voucher ?? IsNull(),
        },
        relations: ['voucherProducts.product'],
      });

      if (previousVoucher?.id === voucher.id) {
        this.logger.warn(
          `Voucher ${voucher.code} is the same as the previous voucher`,
          context,
        );
        throw new OrderException(
          OrderValidation.VOUCHER_IS_THE_SAME_PREVIOUS_VOUCHER,
        );
      }

      // await this.voucherUtils.validateVoucher(voucher);
      await this.voucherUtils.validateVoucherTime(voucher);
      this.voucherUtils.validateVoucherRemainingUsage(voucher);
      await this.voucherUtils.validateVoucherUsage(voucher, order.owner.slug);
      await this.voucherUtils.validateMinOrderValue(voucher, order);

      await this.voucherUtils.validateVoucherProduct(
        voucher,
        order.orderItems.map((item) => item.variant.slug),
      );
    }

    // Update order
    const updatedOrder = await this.transactionManagerService.execute<Order>(
      async (manager) => {
        if (order.payment) {
          await this.paymentUtils.cancelPayment(order.payment.slug);
        }

        if (voucher) {
          // Update remaining quantity of voucher
          voucher.remainingUsage -= 1;

          // Update order
          order.voucher = voucher;

          // update order item => add voucher value
          if (
            voucher.applicabilityRule === VoucherApplicabilityRule.ALL_REQUIRED
          ) {
            if (voucher.type === VoucherType.SAME_PRICE_PRODUCT) {
              const updatedOrderItems = order.orderItems.map((orderItem) => {
                const updatedOrderItem =
                  this.orderItemUtils.getUpdatedOrderItem(
                    voucher,
                    orderItem,
                    true, // is add voucher
                  );
                return updatedOrderItem;
              });
              order.orderItems = updatedOrderItems;
            } else {
              // with other voucher type => remove voucher value
              const updatedOrderItems = order.orderItems.map((orderItem) => {
                const updatedOrderItem =
                  this.orderItemUtils.getUpdatedOrderItem(
                    null,
                    orderItem,
                    false, // is add voucher
                  );
                return updatedOrderItem;
              });
              order.orderItems = updatedOrderItems;
            }
          }

          if (
            voucher.applicabilityRule ===
            VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED
          ) {
            const updatedOrderItems = order.orderItems.map((orderItem) => {
              const updatedOrderItem = this.orderItemUtils.getUpdatedOrderItem(
                voucher,
                orderItem,
                true, // is add voucher
              );
              return updatedOrderItem;
            });
            order.orderItems = updatedOrderItems;
          }

          const { subtotal } = await this.orderUtils.getOrderSubtotal(
            order,
            voucher,
          );
          order.subtotal = subtotal;

          await manager.save(voucher);
        }

        if (previousVoucher) {
          previousVoucher.remainingUsage += 1;
          await manager.save(previousVoucher);
        }

        return await manager.save(order);
      },
      (result) => {
        this.logger.log(
          `Order with slug ${result.slug} updated successfully`,
          context,
        );
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

  async updateVoucherOrderPublic(
    slug: string,
    orders: string[],
    requestData: UpdateVoucherOrderRequestDto,
  ): Promise<OrderResponseDto> {
    const context = `${OrderService.name}.${this.updateOrder.name}`;

    if (!orders.includes(slug)) {
      this.logger.warn(`Order ${slug} is not in the list`, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }

    return await this.updateVoucherOrder(slug, requestData);
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

    // Get voucher
    let voucher: Voucher = null;
    try {
      voucher = await this.voucherUtils.getVoucher({
        where: {
          slug: requestData.voucher ?? IsNull(),
        },
        relations: ['voucherProducts.product'],
      });
    } catch (error) {
      this.logger.warn(`${error.message}`, context);
    }

    if (voucher) {
      // await this.voucherUtils.validateVoucher(voucher);
      await this.voucherUtils.validateVoucherTime(voucher);
      this.voucherUtils.validateVoucherRemainingUsage(voucher);
      await this.voucherUtils.validateVoucherUsage(voucher, requestData.owner);
      await this.voucherUtils.validateVoucherProduct(
        voucher,
        requestData.orderItems.map((item) => item.variant) || [],
      );
    }

    // Construct order
    const order: Order = await this.constructOrder(requestData);

    // Get order items
    const orderItems = await this.constructOrderItems(
      requestData.branch,
      requestData.orderItems,
      voucher,
    );
    this.logger.log(`Number of order items: ${orderItems.length}`, context);
    order.orderItems = orderItems;

    if (voucher) {
      await this.voucherUtils.validateMinOrderValue(voucher, order);
      // Update remaining quantity of voucher
      voucher.remainingUsage -= 1;
    }

    order.voucher = voucher;

    const { subtotal } = await this.orderUtils.getOrderSubtotal(order, voucher);
    order.subtotal = subtotal;

    order.originalSubtotal = order.orderItems.reduce(
      (previous, current) => previous + current.originalSubtotal,
      0,
    );

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
          15 * 60 * 1000,
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

    const defaultCustomer = await this.userUtils.getUser({
      where: {
        phonenumber: 'default-customer',
        role: {
          name: RoleEnum.Customer,
        },
      },
    });

    // Get owner
    // let owner = await this.userUtils.getUser({
    //   where: { slug: data.owner ?? IsNull() },
    // });
    let owner = await this.userRepository.findOne({
      where: { slug: data.owner ?? IsNull() },
    });
    if (!owner) owner = defaultCustomer;

    // Get cashier
    // let approvalBy = await this.userUtils.getUser({
    //   where: {
    //     slug: data.approvalBy ?? IsNull(),
    //   },
    // });
    let approvalBy = await this.userRepository.findOne({
      where: { slug: data.approvalBy ?? IsNull() },
    });
    if (!approvalBy) approvalBy = defaultCustomer;
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
    voucher?: Voucher,
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
        async (item) => await this.constructOrderItem(item, menu, voucher),
      ),
    );
  }

  async constructOrderItem(
    item: CreateOrderItemRequestDto,
    menu: Menu,
    voucher?: Voucher,
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

    // Check item is applied to voucher or not
    let appliedVoucher: Voucher = null;
    const voucherProduct = voucher?.voucherProducts.find(
      (voucherProduct) => voucherProduct.product.id === variant.product.id,
    );
    if (voucherProduct) {
      appliedVoucher = voucher;
    }

    const { subtotal, voucherValue } = this.orderItemUtils.calculateSubTotal(
      orderItem,
      promotion,
      appliedVoucher,
    );
    const originalSubtotal = orderItem.quantity * orderItem.variant.price;

    Object.assign(orderItem, {
      subtotal,
      originalSubtotal,
    });
    // default discount type is none
    orderItem.voucherValue = 0;
    orderItem.discountType = DiscountType.NONE;

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

    if (options.startDate && !options.endDate) {
      throw new OrderException(OrderValidation.END_DATE_CAN_NOT_BE_EMPTY);
    }

    if (options.endDate && !options.startDate) {
      throw new OrderException(OrderValidation.START_DATE_CAN_NOT_BE_EMPTY);
    }

    if (options.startDate && options.endDate) {
      options.startDate = moment(options.startDate).startOf('day').toDate();
      options.endDate = moment(options.endDate).endOf('day').toDate();
      findOptionsWhere.createdAt = Between(options.startDate, options.endDate);
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
        'voucher.voucherProducts.product',
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

    // get job print invoice
    const orderIds = orders.map((order) => order.id);

    const printerJobs = await this.printerJobRepository.find({
      where: {
        jobType: PrinterJobType.INVOICE,
        data: In(orderIds),
      },
    });

    // job.data is orderId
    const jobsMap = _.groupBy(printerJobs, (job) => job.data);
    const jobDtosMap = _.mapValues(jobsMap, (jobs) =>
      this.mapper.mapArray(jobs, PrinterJob, PrinterJobResponseDto),
    );

    // order type any because order does not have printerInvoices field
    orders.forEach((order: any) => {
      order.printerInvoices = jobDtosMap[order.id] || [];
    });

    // order does not have printerInvoices field
    // OrderResponseDto have printerInvoices field
    // to map and keep printerInvoices field, need change mapper
    // forMember(
    //   (destination) => destination.printerInvoices,
    //   mapFrom((source: any) => source.printerInvoices),
    // )
    // squeeze type any
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

  async rePrintFailedInvoicePrinterJobs(slug: string) {
    const context = `${OrderService.name}.${this.rePrintFailedInvoicePrinterJobs.name}`;

    const order = await this.orderRepository.findOne({
      where: { slug },
    });
    if (!order) {
      this.logger.warn(`Order ${slug} not found`, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }
    if (order.status !== OrderStatus.PAID) {
      this.logger.warn(
        `Order ${slug} is not paid, can not re-print failed invoice printer jobs`,
        context,
      );
      throw new OrderException(OrderValidation.ORDER_IS_NOT_PAID);
    }
    const printerJobs = await this.printerJobRepository.find({
      where: {
        jobType: PrinterJobType.INVOICE,
        data: order.id,
        status: PrinterJobStatus.FAILED,
      },
    });
    printerJobs.map((job) => {
      job.status = PrinterJobStatus.PENDING;
      job.error = null;
    });

    await this.printerJobRepository.save(printerJobs);
    this.logger.log(
      `Re-print ${printerJobs.length} failed printer jobs for invoice ${slug}`,
      context,
    );
    return this.mapper.mapArray(printerJobs, PrinterJob, PrinterJobResponseDto);
  }

  async getAllOrdersBySlugArray(data: string[]): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { slug: In(data) },
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
        'voucher.voucherProducts.product',
      ],
      order: { createdAt: 'DESC' },
    });
    return this.mapper.mapArray(orders, Order, OrderResponseDto);
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
