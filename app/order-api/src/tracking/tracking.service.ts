import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Tracking } from './tracking.entity';
import {
  CreateTrackingRequestDto,
  GetTrackingRequestDto,
  TrackingResponseDto,
} from './tracking.dto';
import {
  CreateTrackingOrderItemRequestDto,
  CreateTrackingOrderItemWithQuantityAndOrderItemEntity,
} from 'src/tracking-order-item/tracking-order-item.dto';
import { Order } from 'src/order/order.entity';
import { OrderItem } from 'src/order-item/order-item.entity';
import { TrackingType, WorkflowStatus } from './tracking.constants';
import { TrackingOrderItem } from 'src/tracking-order-item/tracking-order-item.entity';
import { Table } from 'src/table/table.entity';
import { OrderType } from 'src/order/order.contants';
import { RobotConnectorClient } from 'src/robot-connector/robot-connector.client';
import {
  QRLocationResponseDto,
  RobotResponseDto,
  RunWorkflowRequestDto,
  WorkflowExecutionResponseDto,
} from 'src/robot-connector/robot-connector.dto';
import { Workflow } from 'src/workflow/workflow.entity';
import { RobotStatus } from 'src/robot-connector/robot-connector.constants';
import * as _ from 'lodash';
import { TrackingScheduler } from './tracking.scheduler';
import { TrackingException } from './tracking.exception';
import { TrackingValidation } from './tracking.validation';
import { OrderItemException } from 'src/order-item/order-item.exception';
import { OrderItemValidation } from 'src/order-item/order-item.validation';
import { TableException } from 'src/table/table.exception';
import { TableValidation } from 'src/table/table.validation';
import { WorkflowException } from 'src/workflow/workflow.exception';
import { WorkflowValidation } from 'src/workflow/workflow.validation';
import { RobotConnectorException } from 'src/robot-connector/robot-connector.exception';
import { RobotConnectorValidation } from 'src/robot-connector/robot-connector.validation';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import { AppPaginatedResponseDto } from 'src/app/app.dto';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    @InjectRepository(TrackingOrderItem)
    private readonly trackingOrderItemRepository: Repository<TrackingOrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly robotConnectorClient: RobotConnectorClient,
    private readonly dataSource: DataSource,
    private readonly trackingScheduler: TrackingScheduler,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getRobotId() {
    const context = `${TrackingService.name}.${this.getRobotId.name}`;
    const robotId = await this.systemConfigService.get(
      SystemConfigKey.ROBOT_ID,
    );
    this.logger.log(`Robot id loaded: ${robotId}`, context);
    return robotId;
  }

  async getAllTrackings(options: GetTrackingRequestDto) {
    const findOptionsWhere: FindOptionsWhere<any> = {};
    if (options.status.length > 0) {
      findOptionsWhere.status = In(options.status);
    }
    const findManyOptions: FindManyOptions<Tracking> = {
      where: findOptionsWhere,
      order: { createdAt: 'DESC' },
    };
    if (options.hasPaging) {
      Object.assign(findManyOptions, {
        skip: (options.page - 1) * options.size,
        take: options.size,
      });
    }
    const [trackings, total] =
      await this.trackingRepository.findAndCount(findManyOptions);

    const trackingDto = this.mapper.mapArray(
      trackings,
      Tracking,
      TrackingResponseDto,
    );
    const page = options.hasPaging ? options.page : 1;
    const pageSize = options.hasPaging ? options.size : total;

    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: trackingDto,
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<TrackingResponseDto>;
  }

  /**
   *
   * @param {CreateTrackingRequestDto} requestData The data to create a new tracking
   * @returns {Promise<TrackingResponseDto>} The created tracking data
   */
  async createTracking(
    requestData: CreateTrackingRequestDto,
  ): Promise<TrackingResponseDto> {
    const context = `${TrackingService.name}.${this.createTracking.name}`;

    await this.checkCurrentShipment();

    if (_.isEmpty(requestData.trackingOrderItems)) {
      this.logger.warn(
        TrackingValidation.INVALID_DATA_CREATE_TRACKING_ORDER_ITEM.message,
        context,
      );
      throw new TrackingException(
        TrackingValidation.INVALID_DATA_CREATE_TRACKING_ORDER_ITEM,
      );
    }

    const orderItemsData = await this.validateDefinedAndQuantityOrderItem(
      requestData.trackingOrderItems,
    );

    // validate order item of orders in a table
    await this.validateOrderItemInOneTable(requestData.trackingOrderItems);

    let savedTrackingId: string = '';
    if (requestData.type === TrackingType.BY_ROBOT) {
      const order = await this.getOrderByOrderItemSlug(
        _.first(requestData.trackingOrderItems).orderItem,
      );

      const tableLocation: string = await this.getLocationTableByOrder(
        order?.id,
      );

      const workflowId: string = await this.getWorkflowIdByBranchId(
        order.branch?.id,
      );

      await this.checkRobotStatusBeforeCall();

      const runWorkflowData: RunWorkflowRequestDto = {
        runtime_config: {
          raybot_id: await this.getRobotId(),
          location: tableLocation,
          order_code: order.slug,
        },
      };
      const workflowRobot: WorkflowExecutionResponseDto =
        await this.robotConnectorClient.runWorkflow(
          workflowId,
          runWorkflowData,
        );

      const tracking = new Tracking();
      Object.assign(tracking, {
        workflowExecution: workflowRobot.workflow_execution_id,
      });

      savedTrackingId = await this.createTrackingAndTrackingOrderItem(
        tracking,
        orderItemsData,
      );
      this.trackingScheduler.startUpdateStatusTracking();
    }

    if (requestData.type === TrackingType.BY_STAFF) {
      const tracking = new Tracking();
      Object.assign(tracking, { status: WorkflowStatus.COMPLETED });

      savedTrackingId = await this.createTrackingAndTrackingOrderItem(
        tracking,
        orderItemsData,
      );
      await this.trackingScheduler.updateStatusOrder(savedTrackingId);
    }

    await this.softDeleteOldTrackingOrderItemFailed(
      orderItemsData.map((item) => item.orderItem?.id),
    );

    const trackingData = await this.trackingRepository.findOne({
      where: {
        id: savedTrackingId,
      },
      relations: ['trackingOrderItems.orderItem'],
    });

    const TrackingDto = this.mapper.map(
      trackingData,
      Tracking,
      TrackingResponseDto,
    );
    return TrackingDto;
  }

  async createTrackingAllCases(
    requestData: CreateTrackingRequestDto,
  ): Promise<TrackingResponseDto> {
    const context = `${TrackingService.name}.${this.createTracking.name}`;

    if (_.isEmpty(requestData.trackingOrderItems)) {
      this.logger.warn(
        TrackingValidation.INVALID_DATA_CREATE_TRACKING_ORDER_ITEM.message,
        context,
      );
      throw new TrackingException(
        TrackingValidation.INVALID_DATA_CREATE_TRACKING_ORDER_ITEM,
      );
    }

    const orderItemsData = await this.validateDefinedAndQuantityOrderItem(
      requestData.trackingOrderItems,
    );

    let savedTrackingId: string = '';
    if (requestData.type === TrackingType.BY_ROBOT) {
      await this.checkCurrentShipment();

      await this.checkRobotStatusBeforeCall();

      // validate order item of orders in a table
      const orders = await this.validateOrderItemInOneTable(
        requestData.trackingOrderItems,
      );
      const order = _.first(orders);

      const tableLocation: string = await this.getLocationTableByOrder(
        order?.id,
      );

      const workflowId: string = await this.getWorkflowIdByBranchId(
        order.branch?.id,
      );

      const runWorkflowData: RunWorkflowRequestDto = {
        runtime_config: {
          raybot_id: await this.getRobotId(),
          location: tableLocation,
          order_code: order.slug,
        },
      };
      const workflowRobot: WorkflowExecutionResponseDto =
        await this.robotConnectorClient.runWorkflow(
          workflowId,
          runWorkflowData,
        );

      const tracking = new Tracking();
      Object.assign(tracking, {
        workflowExecution: workflowRobot.workflow_execution_id,
      });

      savedTrackingId = await this.createTrackingAndTrackingOrderItem(
        tracking,
        orderItemsData,
      );
      this.trackingScheduler.startUpdateStatusTracking();
    }

    if (requestData.type === TrackingType.BY_STAFF) {
      const tracking = new Tracking();
      Object.assign(tracking, { status: WorkflowStatus.COMPLETED });

      savedTrackingId = await this.createTrackingAndTrackingOrderItem(
        tracking,
        orderItemsData,
      );
      await this.trackingScheduler.updateStatusOrder(savedTrackingId);
    }

    await this.softDeleteOldTrackingOrderItemFailed(
      orderItemsData.map((item) => item.orderItem?.id),
    );

    const trackingData = await this.trackingRepository.findOne({
      where: {
        id: savedTrackingId,
      },
      relations: ['trackingOrderItems.orderItem'],
    });

    const TrackingDto = this.mapper.map(
      trackingData,
      Tracking,
      TrackingResponseDto,
    );
    return TrackingDto;
  }

  /**
   *
   * @param {string[]} orderItemIds The array of order item ids need delete failed tracking
   */
  async softDeleteOldTrackingOrderItemFailed(
    orderItemIds: string[],
  ): Promise<void> {
    const trackingOrderItems = await this.trackingOrderItemRepository.find({
      where: {
        orderItem: {
          id: In(orderItemIds),
        },
        tracking: {
          status: WorkflowStatus.FAILED,
        },
      },
    });
    const trackingOrderItemIds = trackingOrderItems.map((item) => item.id);
    await this.trackingOrderItemRepository.softDelete({
      id: In(trackingOrderItemIds),
    });
  }

  async getOrderByOrderItemSlug(orderItemSlug: string): Promise<Order> {
    const orderItem = await this.orderItemRepository.findOne({
      where: {
        slug: orderItemSlug,
      },
      relations: ['order.branch', 'order.orderItems'],
    });
    const order = orderItem.order;
    console.log('a');
    return order;
  }

  /**
   * Check current shipment
   * @throws {TrackingException} If there are shipments running or pending
   */
  async checkCurrentShipment(): Promise<void> {
    const context = `${TrackingService.name}.${this.checkCurrentShipment.name}`;
    const trackings = await this.trackingRepository.find({
      where: {
        status: In([WorkflowStatus.PENDING, WorkflowStatus.RUNNING]),
      },
    });
    if (!_.isEmpty(trackings)) {
      this.logger.warn(
        TrackingValidation.WAIT_FOR_CURRENT_SHIPMENT_COMPLETED.message,
        context,
      );
      throw new TrackingException(
        TrackingValidation.WAIT_FOR_CURRENT_SHIPMENT_COMPLETED,
      );
    }
  }

  /**
   * Validate the order item about the definition and request quantity
   * @param {CreateTrackingOrderItemRequestDto[]} orderItems The array of data to create many order item
   * @returns {Promise<CreateTrackingOrderItemWithQuantityAndOrderItemEntity[]>} The result of validation
   * @throws {OrderItemException} If order item not found
   * @throws {OrderItemException} If order item not belong to any order
   * @throws {OrderItemException} If request order item greater order item quantity
   */
  async validateDefinedAndQuantityOrderItem(
    createTrackingOrderItems: CreateTrackingOrderItemRequestDto[],
  ): Promise<CreateTrackingOrderItemWithQuantityAndOrderItemEntity[]> {
    const context = `${TrackingService.name}.${this.validateDefinedAndQuantityOrderItem.name}`;
    const orderItemsData: CreateTrackingOrderItemWithQuantityAndOrderItemEntity[] =
      [];
    for (const createTrackingOrderItem of createTrackingOrderItems) {
      // check defined
      const orderItem = await this.orderItemRepository.findOne({
        where: {
          slug: createTrackingOrderItem.orderItem,
        },
        relations: ['order', 'trackingOrderItems.tracking'],
      });
      if (!orderItem) {
        this.logger.warn(
          OrderItemValidation.ORDER_ITEM_NOT_FOUND.message,
          context,
        );
        throw new OrderItemException(OrderItemValidation.ORDER_ITEM_NOT_FOUND);
      }
      if (!orderItem.order) {
        this.logger.warn(
          OrderItemValidation.ORDER_ITEM_NOT_BELONG_TO_ANY_ORDER.message,
          context,
        );
        throw new OrderItemException(
          OrderItemValidation.ORDER_ITEM_NOT_BELONG_TO_ANY_ORDER,
        );
      }

      orderItemsData.push({
        quantity: createTrackingOrderItem.quantity,
        orderItem,
      });

      // order item have not tracking order item
      if (_.isEmpty(orderItem.trackingOrderItems)) {
        if (createTrackingOrderItem.quantity > orderItem.quantity) {
          this.logger.warn(
            OrderItemValidation.REQUEST_ORDER_ITEM_GREATER_ORDER_ITEM_QUANTITY
              .message,
            context,
          );
          throw new OrderItemException(
            OrderItemValidation.REQUEST_ORDER_ITEM_GREATER_ORDER_ITEM_QUANTITY,
          );
        } else continue;
      }

      // order item have tracking order item
      // note: cho phép gọi nhiều đơn nếu không dùng robot
      // => cần kiểm tra đối với số lượng đang được xử lý bởi robot
      const totalHandling = orderItem.trackingOrderItems.reduce(
        (total, item) => {
          return item.tracking.status === WorkflowStatus.COMPLETED ||
            item.tracking.status === WorkflowStatus.PENDING ||
            item.tracking.status === WorkflowStatus.RUNNING
            ? total + item.quantity
            : total;
        },
        0,
      );
      if (
        totalHandling + createTrackingOrderItem.quantity >
        orderItem.quantity
      ) {
        this.logger.warn(
          OrderItemValidation.REQUEST_ORDER_ITEM_GREATER_ORDER_ITEM_QUANTITY
            .message,
          context,
        );
        throw new OrderItemException(
          OrderItemValidation.REQUEST_ORDER_ITEM_GREATER_ORDER_ITEM_QUANTITY,
        );
      }
    }

    return orderItemsData;
  }

  /**
   *
   * @param {CreateTrackingOrderItemRequestDto[]} orderItems The data to create tracking order item
   */
  async validateOrderItemInOneTable(
    orderItems: CreateTrackingOrderItemRequestDto[],
  ): Promise<Order[]> {
    const context = `${TrackingService.name}.${this.validateOrderItemInOneTable.name}`;
    const orderItemSlugs = orderItems.map((item) => item.orderItem);
    const orders = await this.orderRepository.find({
      where: {
        orderItems: {
          slug: In(orderItemSlugs),
        },
      },
      relations: ['branch', 'table'],
    });

    if (_.isEmpty(orders)) {
      this.logger.warn(
        TrackingValidation.ORDERS_MUST_BELONG_TO_ONE_TABLE.message,
        context,
      );
      new TrackingException(TrackingValidation.ORDERS_MUST_BELONG_TO_ONE_TABLE);
    }

    const isValidOrderType = orders.every(
      (order) => order.type === OrderType.AT_TABLE && order.table,
    );
    if (!isValidOrderType) {
      this.logger.warn(
        `${TrackingValidation.ORDER_TAKE_OUT_CAN_NOT_USE_ROBOT.message}`,
        context,
      );
      throw new TrackingException(
        TrackingValidation.ORDER_TAKE_OUT_CAN_NOT_USE_ROBOT,
      );
    }

    const isOrdersOneTable = orders.every(
      (order) => order.table?.id === _.first(orders).table?.id,
    );
    if (!isOrdersOneTable) {
      this.logger.warn(
        TrackingValidation.ORDERS_MUST_BELONG_TO_ONE_TABLE.message,
        context,
      );
      new TrackingException(TrackingValidation.ORDERS_MUST_BELONG_TO_ONE_TABLE);
    }

    return orders;
  }

  /**
   * Get location of table
   * @param {Order} order The data of order have branch data
   * @returns {Promise<string>} The location of table
   * @throws {TableException} If table not found
   * @throws {TableException} If table does not have location
   */
  async getLocationTableByOrder(orderId: string): Promise<string> {
    const context = `${TrackingService.name}.${this.getLocationTableByOrder.name}`;
    const table = await this.tableRepository.findOne({
      where: {
        orders: { id: orderId },
      },
    });
    if (!table) {
      this.logger.warn(TableValidation.TABLE_NOT_FOUND, context);
      throw new TableException(TableValidation.TABLE_NOT_FOUND);
    }
    if (!table.location) {
      this.logger.warn(TableValidation.TABLE_DO_NOT_HAVE_LOCATION, context);
      throw new TableException(TableValidation.TABLE_DO_NOT_HAVE_LOCATION);
    }
    const locationData: QRLocationResponseDto =
      await this.robotConnectorClient.getQRLocationById(table.location);

    return locationData.qr_code;
  }

  /**
   *
   * @param {string} branchId The id of branch
   * @returns {Promise<string>} The workflow id from ROBOT API
   * @throws {WorkflowException} If branch does not have workflow
   */
  async getWorkflowIdByBranchId(branchId: string): Promise<string> {
    const context = `${TrackingService.name}.${this.getWorkflowIdByBranchId.name}`;
    const workflowData = await this.workflowRepository.findOne({
      where: {
        branch: { id: branchId },
      },
    });
    if (!workflowData) {
      this.logger.warn(
        `${WorkflowValidation.MUST_ADD_WORKFLOW_FOR_BRANCH} ${branchId}`,
        context,
      );
      throw new WorkflowException(
        WorkflowValidation.MUST_ADD_WORKFLOW_FOR_BRANCH,
      );
    }
    return workflowData.workflowId;
  }

  /**
   * @throws {RobotConnectorException} If robot is busy
   */
  async checkRobotStatusBeforeCall(): Promise<void> {
    const context = `${TrackingService.name}.${this.checkRobotStatusBeforeCall.name}`;
    const robotData: RobotResponseDto =
      await this.robotConnectorClient.getRobotById(await this.getRobotId());

    if (robotData.status !== RobotStatus.IDLE) {
      this.logger.warn(
        `${RobotConnectorValidation.ROBOT_BUSY.message} ${await this.getRobotId()}`,
        context,
      );
      throw new RobotConnectorException(RobotConnectorValidation.ROBOT_BUSY);
    }
  }

  /**
   * Create tracking and tracking order item simultaneously with rollback
   * @param {Tracking} tracking The new instance of Tracking
   * @param {CreateTrackingOrderItemWithQuantityAndOrderItemEntity} orderItemsData The array of order item data with each request quantity
   * @returns {Promise<string>} The id of create tracking
   * @throws {TrackingException} If create tracking failed
   */
  async createTrackingAndTrackingOrderItem(
    tracking: Tracking,
    orderItemsData: CreateTrackingOrderItemWithQuantityAndOrderItemEntity[],
  ): Promise<string> {
    const context = `${TrackingService.name}.${this.createTrackingAndTrackingOrderItem.name}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdTracking = await queryRunner.manager.save(tracking);

      // create tracking order item
      const trackingOrderItems = orderItemsData.map((item) => {
        const trackingOrderItem = new TrackingOrderItem();
        Object.assign(trackingOrderItem, {
          quantity: item.quantity,
          orderItem: item.orderItem,
          tracking: createdTracking,
        });
        return trackingOrderItem;
      });
      await queryRunner.manager.save(trackingOrderItems);
      await queryRunner.commitTransaction();
      return createdTracking.id;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.warn(TrackingValidation.CREATE_TRACKING_FAILED, context);
      throw new TrackingException(TrackingValidation.CREATE_TRACKING_FAILED);
    } finally {
      await queryRunner.release();
    }
  }

  async changeStatus(
    slug: string,
    status: string,
  ): Promise<TrackingResponseDto> {
    const orders = await this.trackingScheduler.getAllOrdersByTrackingId(
      '3f15f447-c5b7-4ee2-bcb9-c0cd9bcf0325',
    );

    const tracking = await this.trackingRepository.findOne({
      where: {
        slug,
      },
      relations: ['trackingOrderItems.orderItem'],
    });

    if (!tracking)
      throw new TrackingException(TrackingValidation.TRACKING_NOT_FOUND);

    Object.assign(tracking, { status });
    const updatedTracking = await this.trackingRepository.save(tracking);
    const trackingDto = this.mapper.map(
      updatedTracking,
      Tracking,
      TrackingResponseDto,
    );
    return trackingDto;
  }

  async delete(slug: string): Promise<number> {
    const context = `${TrackingService.name}.${this.delete.name}`;
    const tracking = await this.trackingRepository.findOne({
      where: { slug },
      relations: ['trackingOrderItems'],
    });
    if (!tracking) {
      this.logger.warn(`Tracking ${slug} is not found`, context);
      throw new TrackingException(TrackingValidation.TRACKING_NOT_FOUND);
    }
    const trackingOrderItems = tracking.trackingOrderItems;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create tracking order item
      for (const trackingOrderItem of trackingOrderItems) {
        await queryRunner.manager.softDelete(TrackingOrderItem, {
          slug: trackingOrderItem.slug,
        });
      }
      const deleted = await queryRunner.manager.softDelete(Tracking, { slug });

      await queryRunner.commitTransaction();

      return deleted.affected || 0;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.warn(
        `Create tracking and tracking order item failed`,
        context,
      );
      throw new TrackingException(TrackingValidation.CREATE_TRACKING_ERROR);
    } finally {
      await queryRunner.release();
    }
  }
}
