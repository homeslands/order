import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentAction } from 'src/payment/payment.constants';
import { CardOrderPaymentUpdatedEvent } from './events/card-order-payment-updated.event';
import { CardOrderService } from './card-order.service';

@Injectable()
export class CardOrderListener {
  constructor(private readonly cardOrderService: CardOrderService) {}

  @OnEvent(PaymentAction.CARD_ORDER_PAYMENT_PAID)
  async handleUpdateOrderStatus(payload: CardOrderPaymentUpdatedEvent) {
    await this.cardOrderService.handlePaymentCompletion({
      orderSlug: payload.orderSlug,
    });
  }
}
