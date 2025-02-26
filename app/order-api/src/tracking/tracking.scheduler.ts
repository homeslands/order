import { Inject, Injectable, Logger as NestLogger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TrackingCronEnum, WorkflowStatus } from './tracking.constants';
import { Tracking } from './tracking.entity';
import { RobotConnectorClient } from 'src/robot-connector/robot-connector.client';
import * as _ from 'lodash';
import { OrderStatus } from 'src/order/order.contants';
import { Order } from 'src/order/order.entity';
import { OrderItem } from 'src/order-item/order-item.entity';
import { TrackingOrderItem } from 'src/tracking-order-item/tracking-order-item.entity';

@Injectable()
export class TrackingScheduler {
  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    @InjectRepository(TrackingOrderItem)
    private readonly trackingOrderItemRepository: Repository<TrackingOrderItem>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly robotConnectorClient: RobotConnectorClient,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: NestLogger,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Update status of tracking every 30 seconds
   */
  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: TrackingCronEnum.UPDATE_STATUS_TRACKING,
  })
  async UpdateStatusTracking() {
    const context = `${TrackingScheduler.name}.${this.UpdateStatusTracking.name}`;
    const trackings = await this.trackingRepository.find({
      where: {
        status: In([WorkflowStatus.PENDING, WorkflowStatus.RUNNING]),
      },
    });
    if (_.isEmpty(trackings)) this.stopUpdateStatusTracking();

    // update for tracking
    const workflowExecutionIds = trackings.map(
      (item) => item.workflowExecution,
    );
    await Promise.all(
      workflowExecutionIds.map(async (id) => {
        try {
          const workflow =
            await this.robotConnectorClient.retrieveWorkflowExecution(id);

          const tracking = await this.trackingRepository.findOne({
            where: { workflowExecution: id },
          });

          Object.assign(tracking, { status: workflow.status });
          await this.trackingRepository.save(tracking);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          this.logger.warn(
            `Error processing workflow execution ${id}`,
            context,
          );
        }
      }),
    );

    // update order status
    const trackingIds = trackings.map((item) => item.id);
    await Promise.all(
      trackingIds.map(async (id) => {
        try {
          await this.updateStatusOrder(id);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          this.logger.warn(`Error updating status for order`, context);
        }
      }),
    );
  }

  /**
   * Update latest order status by tracking id
   * @param {string} trackingId The id of tracking
   */
  async updateStatusOrder(trackingId: string) {
    const context = `${TrackingScheduler.name}.${this.updateStatusOrder.name}`;

    const orders: Order[] = await this.getAllOrdersByTrackingId(trackingId);

    // check by total quantity each order item
    await Promise.all(
      orders.map(async (order) => {
        const totalBase = order.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalQuantity = this.calculateTotalQuantity(order.orderItems);

        if (totalBase > totalQuantity[WorkflowStatus.COMPLETED]) {
          if (totalQuantity[WorkflowStatus.RUNNING] > 0) {
            Object.assign(order, { status: OrderStatus.SHIPPING });
            await this.orderRepository.save(order);
          }
        } else if (totalBase === totalQuantity[WorkflowStatus.COMPLETED]) {
          Object.assign(order, { status: OrderStatus.COMPLETED });
          await this.orderRepository.save(order);
        }
        this.logger.log(`Order status ${order.slug} has been updated`, context);
      }),
    );
  }

  /**
   *
   * @param {string} trackingId The id of tracking
   * @returns {Promise<Order[]>} The array of orders
   */
  async getAllOrdersByTrackingId(trackingId: string): Promise<Order[]> {
    const trackingOrderItems = await this.trackingOrderItemRepository.find({
      where: {
        tracking: { id: trackingId },
      },
    });
    const orderItems: OrderItem[] = await Promise.all(
      trackingOrderItems.map((trackingOrderItem) =>
        this.orderItemRepository.findOne({
          where: {
            trackingOrderItems: { id: trackingOrderItem.id },
          },
        }),
      ),
    );
    const orderItemIds = orderItems.map((orderItem) => orderItem.id);
    const orders: Order[] = await this.orderRepository.find({
      where: {
        orderItems: { id: In(orderItemIds) },
      },
    });

    const results: Order[] = await Promise.all(
      orders.map((order) =>
        this.orderRepository.findOne({
          where: { id: order.id },
          relations: ['orderItems.trackingOrderItems.tracking'],
        }),
      ),
    );

    return results;
  }

  /**
   * Get quantity of running and completed tracking
   * @param {OrderItem[]} orderItems The array of order item relate to tracking
   * @returns {Record<WorkflowStatus, number>} The result for RUNNING and COMPLETED tracking with quantity
   */
  public calculateTotalQuantity(
    orderItems: OrderItem[],
  ): Record<WorkflowStatus, number> {
    const totalQuantity = orderItems.reduce(
      (totals, item) => {
        const itemQuantity = item.trackingOrderItems.reduce(
          (statusSums, trackingItem) => {
            const status = trackingItem.tracking.status;
            if (
              status === WorkflowStatus.COMPLETED ||
              status === WorkflowStatus.RUNNING
            ) {
              statusSums[status] =
                (statusSums[status] || 0) + trackingItem.quantity;
            }
            return statusSums;
          },
          {} as Record<WorkflowStatus, number>,
        );

        Object.keys(itemQuantity).forEach((status) => {
          totals[status as WorkflowStatus] =
            (totals[status as WorkflowStatus] || 0) +
            itemQuantity[status as WorkflowStatus];
        });

        return totals;
      },
      {
        [WorkflowStatus.COMPLETED]: 0,
        [WorkflowStatus.RUNNING]: 0,
      } as Record<WorkflowStatus, number>,
    );
    return totalQuantity;
  }

  /**
   * Stop a specific cron function
   * @param {string} name The name of cron function
   */
  stopUpdateStatusTracking() {
    const context = `${TrackingScheduler.name}.${this.stopUpdateStatusTracking.name}`;
    const job = this.schedulerRegistry.getCronJob(
      TrackingCronEnum.UPDATE_STATUS_TRACKING,
    );
    job.stop();
    this.logger.log(`Update tracking status job has been stopped.`, context);
  }

  /**
   * Restart a specific cron function
   */
  startUpdateStatusTracking() {
    const context = `${TrackingScheduler.name}.${this.startUpdateStatusTracking.name}`;
    const job = this.schedulerRegistry.getCronJob(
      TrackingCronEnum.UPDATE_STATUS_TRACKING,
    );
    job.start();
    this.logger.log(
      `Cron job "${TrackingCronEnum.UPDATE_STATUS_TRACKING}" has been restarted.`,
      context,
    );
  }
}
