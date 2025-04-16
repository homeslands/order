import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { ExportInvoiceDto } from 'src/invoice/invoice.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { MailService } from 'src/mail/mail.service';
import { NotificationUtils } from 'src/notification/notification.utils';
import { OrderStatus } from 'src/order/order.constants';
import { Order } from 'src/order/order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { PaymentStatus } from 'src/payment/payment.constants';
import { IsNull, Repository } from 'typeorm';
import _ from 'lodash';
import { Job } from './job.entity';
import { JobStatus } from './job.constants';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class JobService {
  constructor(
    private readonly orderUtils: OrderUtils,
    private readonly mailService: MailService,
    private readonly invoiceService: InvoiceService,
    private readonly chefOrderUtils: ChefOrderUtils,
    private readonly notificationUtils: NotificationUtils,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly transactionManagerService: TransactionManagerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async updateOrderStatusAfterPaymentPaid(job: Job) {
    const context = `${JobService.name}.${this.updateOrderStatusAfterPaymentPaid.name}`;
    this.logger.log(
      `Update order status after payment process in job`,
      context,
    );
    let orderSlug = null;
    try {
      this.logger.log(`Request data: ${JSON.stringify(job)}`, context);
      const order = await this.orderUtils.getOrder({
        where: {
          id: job.data ?? IsNull(),
        },
      });
      orderSlug = order.slug;

      this.logger.log(`Current order: ${JSON.stringify(order)}`, context);

      if (
        order.payment?.statusCode === PaymentStatus.COMPLETED &&
        order.status === OrderStatus.PENDING &&
        order.referenceNumber === null
      ) {
        const lastOrderWithNumber = await this.orderRepository.findOne({
          where: {
            branch: { id: order.branch.id },
            payment: { statusCode: PaymentStatus.COMPLETED },
          },
          order: {
            referenceNumber: 'DESC',
          },
        });

        const nextReferenceNumber =
          (lastOrderWithNumber?.referenceNumber ?? 0) + 1;

        // Update order status to PAID
        await this.transactionManagerService.execute(
          async (manager) => {
            Object.assign(order, {
              status: OrderStatus.PAID,
              referenceNumber: nextReferenceNumber,
            });
            await manager.save(order);

            Object.assign(job, { status: JobStatus.COMPLETED });
            await manager.save(job);
          },
          () => {
            this.logger.log(
              `Update order status to PAID successfully`,
              context,
            );
          },
          (error) => {
            this.logger.error(
              `Error creating table: ${error.message}`,
              error.stack,
              context,
            );
            return;
          },
        );

        // Send notification to all chef role users in the same branch
        await this.notificationUtils.sendNotificationAfterOrderIsPaid(order);

        // Sperate order to chef orders
        if (_.isEmpty(order.chefOrders)) {
          await this.chefOrderUtils.createChefOrder(job.data);
        }

        // send invoice email
        const invoice = await this.invoiceService.exportInvoice({
          order: order.slug,
        } as ExportInvoiceDto);
        await this.mailService.sendInvoiceWhenOrderPaid(order.owner, invoice);

        this.logger.log(`Update order status from PENDING to PAID`, context);
      }
    } catch (error) {
      this.logger.error(
        `Error when create chef orders from order ${orderSlug}`,
        error.stack,
        context,
      );
    }
  }
}
