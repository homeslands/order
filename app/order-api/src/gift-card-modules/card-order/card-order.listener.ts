import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentAction } from 'src/payment/payment.constants';
import { JobProducer } from 'src/job/job.producer';
import { JobType } from 'src/job/job.constants';
import { CardOrderPaymentUpdatedEvent } from './events/card-order-payment-updated.event';

@Injectable()
export class CardOrderListener {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly jobProducer: JobProducer,
  ) {}

  @OnEvent(PaymentAction.CARD_ORDER_PAYMENT_PAID)
  async handleUpdateOrderStatus(payload: CardOrderPaymentUpdatedEvent) {
    await this.jobProducer.createJob({
      type: JobType.UPDATE_CARD_ORDER_STATUS_AFTER_PAYMENT_PAID,
      data: payload.orderId,
    });
  }
}
