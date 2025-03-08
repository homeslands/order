import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderStatus } from './order.contants';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { OrderUtils } from './order.utils';
import moment from 'moment';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';

@Injectable()
export class OrderScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly orderUtils: OrderUtils,
    private readonly menuItemUtils: MenuItemUtils,
  ) {}

  // Cancel order job
  private async cancelOrder(orderSlug: string) {
    const context = `${OrderScheduler.name}.${this.cancelOrder.name}`;
    this.logger.log(`Cancel order ${orderSlug}`, context);

    const order = await this.orderUtils.getOrder({
      where: {
        slug: orderSlug,
      },
    });

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${orderSlug} is not pending`, context);
      return;
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
    await this.transactionManagerService.execute<void>(
      async (manager) => {
        // Update stock of menu items
        await manager.save(menuItems);
        this.logger.log(
          `Menu items: ${menuItems.map((item) => item.product.name).join(', ')} updated`,
          context,
        );

        // Remove order items
        if (order.orderItems) await manager.remove(order.orderItems);

        // Remove order
        await manager.remove(order);

        // Remove payment
        if (payment) {
          await manager.remove(payment);
          this.logger.log(`Payment has been removed`, context);
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
        this.schedulerRegistry.deleteTimeout(jobName);
      }
    } catch (error) {
      this.logger.error(
        `Error when get job ${orderSlug}: ${error.message}`,
        context,
      );
    }

    const job = setTimeout(async () => {
      await this.cancelOrder(orderSlug);
    }, delay);

    this.schedulerRegistry.addTimeout(jobName, job);
  }
}
