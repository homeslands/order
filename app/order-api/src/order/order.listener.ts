import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentAction, PaymentStatus } from 'src/payment/payment.constants';
import { OrderException } from './order.exception';
import { OrderValidation } from './order.validation';
import { IsNull, Repository } from 'typeorm';
import { OrderUtils } from './order.utils';
import { OrderStatus } from './order.constants';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { MailService } from 'src/mail/mail.service';
import { ExportInvoiceDto } from 'src/invoice/invoice.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { User } from 'src/user/user.entity';
import { NotificationUtils } from 'src/notification/notification.utils';

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
  ) {}

  @OnEvent(PaymentAction.PAYMENT_PAID)
  async handleUpdateOrderStatus(requestData: { orderId: string }) {
    const context = `${OrderListener.name}.${this.handleUpdateOrderStatus.name}`;
    this.logger.log(`Update order status after payment process`, context);
    let orderSlug = null;
    try {
      if (_.isEmpty(requestData)) {
        this.logger.error(`Request data is empty`, null, context);
        throw new OrderException(OrderValidation.ORDER_ID_INVALID);
      }

      this.logger.log(`Request data: ${JSON.stringify(requestData)}`, context);
      const order = await this.orderUtils.getOrder({
        where: {
          id: requestData.orderId ?? IsNull(),
        },
      });
      orderSlug = order.slug;

      this.logger.log(`Current order: ${JSON.stringify(order)}`, context);

      if (
        order.payment?.statusCode === PaymentStatus.COMPLETED &&
        order.status === OrderStatus.PENDING
      ) {
        // Update order status to PAID
        Object.assign(order, { status: OrderStatus.PAID });
        await this.orderRepository.save(order);

        // Send notification to all chef role users in the same branch
        await this.notificationUtils.sendNotificationAfterOrderIsPaid(order);

        // Sperate order to chef orders
        if (_.isEmpty(order.chefOrders)) {
          await this.chefOrderUtils.createChefOrder(requestData.orderId);
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
