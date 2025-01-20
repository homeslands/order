import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderStatus } from './order.contants';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Menu } from 'src/menu/menu.entity';
import { OrderUtils } from './order.utils';

@Injectable()
export class OrderScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly orderUtils: OrderUtils,
  ) {}

  // Called once after 5 minutes
  async cancelOrder(orderSlug: string) {
    const context = `${OrderScheduler.name}.${this.cancelOrder.name}`;
    this.logger.log(`Cancel order ${orderSlug}`, context);

    const order = await this.orderRepository.findOne({
      where: { slug: orderSlug },
      relations: ['orderItems.variant.product', 'branch', 'payment'],
    });
    if (!order) {
      this.logger.warn(`Order ${orderSlug} not found`, context);
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${orderSlug} is not pending`, context);
      return;
    }

    // Get all menu items base on unique products
    const menuItems = await this.orderUtils.getCurrentMenuItems(
      order,
      'increment',
    );

    // Delete order
    await this.transactionManagerService.execute<void>(
      async (manager) => {
        await manager.save(menuItems);
        if (order.payment) await manager.remove(order.payment);
        if (order.orderItems) await manager.remove(order.orderItems);
        await manager.remove(order);
        this.logger.log(
          `Menu items: ${menuItems.map((item) => item.product.name).join(', ')} updated`,
          context,
        );
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
      },
    );
  }

  addCancelOrderJob(orderSlug: string, delay: number) {
    const context = `${OrderScheduler.name}.${this.addCancelOrderJob.name}`;
    const jobName = `CANCEL_ORDER_${orderSlug}`;
    this.logger.log(`Add cancel order job ${orderSlug}`, context);

    try {
      const existedJob = this.schedulerRegistry.getTimeout(jobName);
      if (existedJob) {
        this.logger.warn(`Job ${orderSlug} already exists`, context);
        return;
      }
    } catch (error) {
      this.logger.error(
        `Error when get job ${orderSlug}: ${error.message}`,
        context,
      );
    }

    const job = setTimeout(async () => {
      await this.cancelOrder(orderSlug);
    }, delay); // 5 minutes

    this.schedulerRegistry.addTimeout(jobName, job);
  }
}
