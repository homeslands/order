import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentAction, PaymentStatus } from 'src/payment/payment.constants';
import { OrderException } from './order.exception';
import { OrderValidation } from './order.validation';
import { IsNull, Repository } from 'typeorm';
import { OrderUtils } from './order.utils';
import { OrderStatus } from './order.contants';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { MailService } from 'src/mail/mail.service';
import { ExportInvoiceDto } from 'src/invoice/invoice.dto';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class OrderListener {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly orderUtils: OrderUtils,
    private readonly mailService: MailService,
    private readonly invoiceService: InvoiceService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @OnEvent(PaymentAction.PAYMENT_PAID)
  async handleUpdateOrderStatus(requestData: { orderId: string }) {
    const context = `${OrderListener.name}.${this.handleUpdateOrderStatus.name}`;
    this.logger.log(`Update order status after payment process`, context);

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

    this.logger.log(`Current order: ${JSON.stringify(order)}`, context);

    if (
      order.payment?.statusCode === PaymentStatus.COMPLETED &&
      order.status === OrderStatus.PENDING
    ) {
      // send invoice email
      Object.assign(order, { status: OrderStatus.PAID });
      await this.orderRepository.save(order);

      const invoice = await this.invoiceService.exportInvoice({
        order: order.slug,
      } as ExportInvoiceDto);

      await this.mailService.sendInvoiceWhenOrderPaid(order.owner, invoice);

      this.logger.log(`Update order status from PENDING to PAID`, context);
    }
  }
}
