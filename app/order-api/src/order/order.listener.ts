import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentAction } from 'src/payment/payment.constants';
import { Repository } from 'typeorm';
import { OrderUtils } from './order.utils';
import { OrderAction } from './order.constants';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { InvoiceService } from 'src/invoice/invoice.service';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { User } from 'src/user/user.entity';
import { NotificationUtils } from 'src/notification/notification.utils';
import { Mutex } from 'async-mutex';
import { JobProducer } from 'src/job/job.producer';
import { JobType } from 'src/job/job.constants';

@Injectable()
export class OrderListener {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly orderUtils: OrderUtils,
    private readonly mailService: MailService,
    private readonly invoiceService: InvoiceService,
    private readonly chefOrderUtils: ChefOrderUtils,
    // private readonly notificationProducer: NotificationProducer,
    private readonly notificationUtils: NotificationUtils,
    private readonly mutex: Mutex,
    private readonly jobProducer: JobProducer,
  ) {}

  // @OnEvent(PaymentAction.PAYMENT_PAID)
  // async handleUpdateOrderStatus(requestData: { orderId: string }) {
  //   const context = `${OrderListener.name}.${this.handleUpdateOrderStatus.name}`;
  //   this.logger.log(`Update order status after payment process`, context);
  //   let orderSlug = null;

  //   // Lock code
  //   await this.mutex.runExclusive(async () => {
  //     try {
  //       if (_.isEmpty(requestData)) {
  //         this.logger.error(`Request data is empty`, null, context);
  //         throw new OrderException(OrderValidation.ORDER_ID_INVALID);
  //       }

  //       this.logger.log(
  //         `Request data: ${JSON.stringify(requestData)}`,
  //         context,
  //       );
  //       const order = await this.orderUtils.getOrder({
  //         where: {
  //           id: requestData.orderId ?? IsNull(),
  //         },
  //       });
  //       orderSlug = order.slug;

  //       this.logger.log(`Current order: ${JSON.stringify(order)}`, context);

  //       if (
  //         order.payment?.statusCode === PaymentStatus.COMPLETED &&
  //         order.status === OrderStatus.PENDING
  //       ) {
  //         const lastOrderWithNumber = await this.orderRepository.findOne({
  //           where: {
  //             branch: { id: order.branch.id },
  //             payment: { statusCode: PaymentStatus.COMPLETED },
  //           },
  //           order: {
  //             referenceNumber: 'DESC',
  //           },
  //         });

  //         const nextReferenceNumber =
  //           (lastOrderWithNumber?.referenceNumber ?? 0) + 1;

  //         Object.assign(order, {
  //           status: OrderStatus.PAID,
  //           referenceNumber: nextReferenceNumber,
  //         });
  //         await this.orderRepository.save(order);

  //         await this.notificationUtils.sendNotificationAfterOrderIsPaid(order);

  //         if (_.isEmpty(order.chefOrders)) {
  //           await this.chefOrderUtils.createChefOrder(requestData.orderId);
  //         }

  //         // Send invoice email
  //         const invoice = await this.invoiceService.exportInvoice({
  //           order: order.slug,
  //         } as ExportInvoiceDto);
  //         await this.mailService.sendInvoiceWhenOrderPaid(order.owner, invoice);

  //         this.logger.log(`Update order status from PENDING to PAID`, context);
  //       }
  //     } catch (error) {
  //       this.logger.error(
  //         `Error when create chef orders from order ${orderSlug}`,
  //         error.stack,
  //         context,
  //       );
  //     }
  //   });
  // }
  @OnEvent(PaymentAction.PAYMENT_PAID)
  async handleUpdateOrderStatus(requestData: { orderId: string }) {
    await this.jobProducer.createJob({
      type: JobType.UPDATE_STATUS_ORDER_AFTER_PAID,
      data: requestData.orderId,
    });
  }
  // @OnEvent(PaymentAction.PAYMENT_PAID)
  // async handleUpdateOrderStatus(requestData: { orderId: string }) {
  //   const context = `${OrderListener.name}.${this.handleUpdateOrderStatus.name}`;
  //   this.logger.log(`Update order status after payment process`, context);
  //   let orderSlug = null;
  //   try {
  //     if (_.isEmpty(requestData)) {
  //       this.logger.error(`Request data is empty`, null, context);
  //       throw new OrderException(OrderValidation.ORDER_ID_INVALID);
  //     }

  //     this.logger.log(`Request data: ${JSON.stringify(requestData)}`, context);
  //     const order = await this.orderUtils.getOrder({
  //       where: {
  //         id: requestData.orderId ?? IsNull(),
  //       },
  //     });
  //     orderSlug = order.slug;

  //     this.logger.log(`Current order: ${JSON.stringify(order)}`, context);

  //     if (
  //       order.payment?.statusCode === PaymentStatus.COMPLETED &&
  //       order.status === OrderStatus.PENDING
  //     ) {
  //       const lastOrderWithNumber = await this.orderRepository.findOne({
  //         where: {
  //           branch: { id: order.branch.id },
  //           payment: { statusCode: PaymentStatus.COMPLETED },
  //         },
  //         order: {
  //           referenceNumber: 'DESC',
  //         },
  //       });

  //       const nextReferenceNumber =
  //         (lastOrderWithNumber?.referenceNumber ?? 0) + 1;

  //       // Update order status to PAID
  //       Object.assign(order, {
  //         status: OrderStatus.PAID,
  //         referenceNumber: nextReferenceNumber,
  //       });
  //       await this.orderRepository.save(order);
  //       console.log('order', order);

  //       // Send notification to all chef role users in the same branch
  //       await this.notificationUtils.sendNotificationAfterOrderIsPaid(order);

  //       // Sperate order to chef orders
  //       if (_.isEmpty(order.chefOrders)) {
  //         await this.chefOrderUtils.createChefOrder(requestData.orderId);
  //       }

  //       // send invoice email
  //       const invoice = await this.invoiceService.exportInvoice({
  //         order: order.slug,
  //       } as ExportInvoiceDto);
  //       console.log('invoice', invoice);
  //       await this.mailService.sendInvoiceWhenOrderPaid(order.owner, invoice);

  //       this.logger.log(`Update order status from PENDING to PAID`, context);
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `Error when create chef orders from order ${orderSlug}`,
  //       error.stack,
  //       context,
  //     );
  //   }
  // }

  @OnEvent(OrderAction.INIT_ORDER_ITEM_SUCCESS)
  async initOriginalSubtotal() {
    const context = `${OrderListener.name}.${this.initOriginalSubtotal.name}`;
    const orders = await this.orderRepository.find({
      relations: ['orderItems'],
    });
    const updatedOrders: Order[] = [];
    for (const order of orders) {
      order.originalSubtotal = order.orderItems.reduce(
        (acc, item) => acc + item.originalSubtotal,
        0,
      );
      updatedOrders.push(order);
    }
    await this.orderRepository.save(updatedOrders);
    this.logger.log(
      `Init original subtotal for ${orders.length} orders`,
      context,
    );
  }
}
