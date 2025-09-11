import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
// import { ExportInvoiceDto } from 'src/invoice/invoice.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { MailService } from 'src/mail/mail.service';
import { NotificationUtils } from 'src/notification/notification.utils';
import { OrderStatus } from 'src/order/order.constants';
import { Order } from 'src/order/order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { PaymentMethod, PaymentStatus } from 'src/payment/payment.constants';
import { IsNull, Repository } from 'typeorm';
import _ from 'lodash';
import { Job } from './job.entity';
import { JobStatus } from './job.constants';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import {
  PointTransactionObjectTypeEnum,
  PointTransactionTypeEnum,
} from 'src/gift-card-modules/point-transaction/entities/point-transaction.enum';
import { CurrencyUtil } from 'src/shared/utils/currency.util';
import { CreatePointTransactionDto } from 'src/gift-card-modules/point-transaction/dto/create-point-transaction.dto';
import { SharedBalanceService } from 'src/shared/services/shared-balance.service';
import { SharedPointTransactionService } from 'src/shared/services/shared-point-transaction.service';
import { InvoiceAction } from 'src/invoice/invoice.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
    private readonly transactionManagerService: TransactionManagerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly sharedBalanceService: SharedBalanceService,
    private readonly sharedPointTransactionService: SharedPointTransactionService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

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
          async () => {
            this.logger.log(
              `Update order ${order.slug} status to PAID successfully`,
              context,
            );
          },
          (error) => {
            this.logger.error(
              `Error updating order ${order.slug} status: ${error.message}`,
              error.stack,
              context,
            );
            return;
          },
        );

        // Handle calc balance when use point payment method
        if (order.payment?.paymentMethod === PaymentMethod.POINT) {
          // Calc balance
          await this.sharedBalanceService.calcBalance({
            userSlug: order.owner?.slug,
            points: order.payment.amount,
            type: 'out',
          });

          const currentBalance = await this.sharedBalanceService.findOneByField({ userSlug: order.owner?.slug, slug: null })

          // Create point transaction
          await this.sharedPointTransactionService.create({
            type: PointTransactionTypeEnum.OUT,
            desc: `Sử dụng ${CurrencyUtil.formatCurrency(order.subtotal)} xu thanh toán đơn hàng`,
            objectType: PointTransactionObjectTypeEnum.ORDER,
            objectSlug: order.slug,
            points: order.payment?.amount,
            userSlug: order.owner?.slug,
            balance: currentBalance.points
          } as CreatePointTransactionDto);
        }

        // create invoice
        try {
          await this.invoiceService.create(order.slug);
        } catch (error) {
          this.logger.error(
            `Error when create invoice for order ${order.slug}: ${error.message}`,
            error.stack,
            context,
          );
        }

        // call listener to print invoice
        this.eventEmitter.emit(InvoiceAction.INVOICE_CREATED, {
          orderId: order.id,
        });

        // Sperate order to chef orders
        if (_.isEmpty(order.chefOrders)) {
          await this.chefOrderUtils.createChefOrder(job.data, false);
        }

        // Send notification to all chef role users in the same branch
        await this.notificationUtils.sendNotificationAfterOrderIsPaid(order);

        // send invoice email
        // const invoice = await this.invoiceService.exportInvoice({
        //   order: order.slug,
        // } as ExportInvoiceDto);
        // this.mailService.sendInvoiceWhenOrderPaid(order.owner, invoice);

        this.logger.log(`Update order status from PENDING to PAID`, context);
      }
    } catch (error) {
      this.logger.error(
        `Error when create chef orders from order ${orderSlug}: ${error.message}`,
        error.stack,
        context,
      );
    }
  }

  // async updateCardOrderStatusAfterPaymentCompletion(payload: {
  //   orderSlug: string;
  // }) {
  //   const context = `${JobService.name}.${this.updateCardOrderStatusAfterPaymentCompletion.name}`;
  //   this.logger.log(
  //     `Update card order ${payload?.orderSlug} status after payment completion req: ${JSON.stringify(payload)}`,
  //     context,
  //   );

  //   const order = await this.cardOrderRepository.findOne({
  //     where: {
  //       slug: payload.orderSlug,
  //     },
  //     relations: ['payment'],
  //   });

  //   if (!order) {
  //     this.logger.log(`Card order ${payload.orderSlug} not found`, context);
  //   }

  //   if (order.status !== CardOrderStatus.PENDING) {
  //     this.logger.log(`Card order ${order.slug} is not pending`, context);
  //     return;
  //   }

  //   if (order.payment?.statusCode === PaymentStatus.PENDING) {
  //     this.logger.log(
  //       `Payment ${order?.payment?.slug} status is pending`,
  //       context,
  //     );
  //     return;
  //   }

  //   Object.assign(order, {
  //     status:
  //       order.payment?.statusCode === PaymentStatus.COMPLETED
  //         ? CardOrderStatus.COMPLETED
  //         : CardOrderStatus.FAIL,
  //     paymentStatus: order.payment?.statusCode,
  //   } as Partial<CardOrder>);

  //   await this.transactionManagerService.execute<CardOrder>(
  //     async (manager) => {
  //       return await manager.save(order);
  //     },
  //     (result) => {
  //       this.logger.log(
  //         `Card order ${result.slug} status ${result.status}`,
  //         context,
  //       );
  //     },
  //     (err) => {
  //       this.logger.error(
  //         `Error when updating card order status: ${err.message}`,
  //         err.stack,
  //         context,
  //       );
  //     },
  //   );
  // }
}
