import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { OrderUtils } from './order.utils';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { Payment } from 'src/payment/payment.entity';
import { PaymentStatus } from 'src/payment/payment.constants';

@Injectable()
export class OrderScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly orderUtils: OrderUtils,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
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

  @Timeout(10000)
  async updateReferenceNumberForPaidOrdersAndInvoices() {
    const context = `${OrderScheduler.name}.${this.updateReferenceNumberForPaidOrdersAndInvoices.name}`;

    this.logger.log(
      `Start update reference number for paid orders and invoices`,
      context,
    );
    try {
      const branches = await this.branchRepository.find();
      const updatedOrders: Order[] = [];
      for (const branch of branches) {
        // console.log({ branch });
        this.logger.log(
          `Update reference number for branch ${branch.name}`,
          context,
        );
        let firstReferenceNumber = 1;
        const orders = await this.orderRepository.find({
          where: {
            branch: { id: branch.id },
            payment: {
              statusCode: PaymentStatus.COMPLETED,
            },
          },
          order: {
            createdAt: 'ASC',
          },
          relations: ['invoice'],
        });
        for (const order of orders) {
          Object.assign(order, {
            referenceNumber: firstReferenceNumber,
          });
          if (order.invoice) {
            Object.assign(order.invoice, {
              referenceNumber: firstReferenceNumber,
            });
          }
          firstReferenceNumber++;
        }
        updatedOrders.push(...orders);
      }
      await this.orderRepository.save(updatedOrders);
      this.logger.log(
        `Update reference number for orders: ${updatedOrders.length}`,
        context,
      );
    } catch (error) {
      this.logger.error(
        `Error when update reference number for paid orders and invoices: ${error.message}`,
        error.stack,
        context,
      );
    }
  }
}
