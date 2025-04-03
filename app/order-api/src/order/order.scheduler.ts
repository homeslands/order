import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SchedulerRegistry } from '@nestjs/schedule';
import { OrderUtils } from './order.utils';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly orderUtils: OrderUtils,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  handleDeleteOrder(orderSlug: string, delay: number) {
    const context = `${OrderScheduler.name}.${this.handleDeleteOrder.name}`;
    const jobName = `CANCEL_ORDER_${orderSlug}`;
    this.logger.log(`Add cancel order job ${orderSlug}`, context);

    try {
      const existedJob = this.schedulerRegistry.getTimeout(jobName);
      if (existedJob) {
        this.logger.warn(`Job ${orderSlug} already exists`, context);
        this.schedulerRegistry.deleteTimeout(jobName);
      }
    } catch (error) {
      this.logger.error(
        `Error when get job ${orderSlug}: ${error.message}`,
        context,
      );
    }

    const job = setTimeout(async () => {
      await this.orderUtils.deleteOrder(orderSlug);
    }, delay);

    this.schedulerRegistry.addTimeout(jobName, job);
  }
}
