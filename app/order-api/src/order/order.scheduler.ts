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

  @Timeout(1000)
  async updateReferenceNumberForPaidOrdersAndInvoices() {
    const context = `${OrderScheduler.name}.${this.updateReferenceNumberForPaidOrdersAndInvoices.name}`;

    const branches = await this.branchRepository.find();
    const updatedOrders: Order[] = [];
    for (const branch of branches) {
      // console.log({ branch });
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
        Object.assign(order.invoice, {
          referenceNumber: firstReferenceNumber,
        });
        firstReferenceNumber++;
      }
      // console.log({ orders });
      // console.log('length', orders.length);
      updatedOrders.push(...orders);
    }
    // console.log({ length: updatedOrders.length });
    // console.log({ updatedOrders });
    await this.orderRepository.save(updatedOrders);
    this.logger.log(
      `Update reference number for orders: ${updatedOrders.length}`,
      context,
    );
  }
}
