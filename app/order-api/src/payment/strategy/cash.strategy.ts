import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPaymentStrategy } from './payment.strategy';
import { Payment } from '../entity/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentMethod, PaymentStatus } from '../payment.constants';
import { Order } from 'src/order/order.entity';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';

@Injectable()
export class CashStrategy implements IPaymentStrategy {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async process(order: Order): Promise<Payment> {
    const context = `${CashStrategy.name}.${this.process.name}`;
    const payment = {
      paymentMethod: PaymentMethod.CASH,
      amount: order.subtotal,
      loss: order.loss,
      message: 'hoa don thanh toan',
      userId: order.owner.id,
      transactionId: uuidv4(),
      statusCode: PaymentStatus.COMPLETED,
      statusMessage: PaymentStatus.COMPLETED,
    } as Payment;

    this.paymentRepository.create(payment);
    const createdPayment = await this.paymentRepository.save(payment);
    this.logger.log(`Payment created with id: ${createdPayment.id}`, context);

    return createdPayment;
  }

  async processCardOrder(cardOrder: CardOrder): Promise<Payment> {
    const context = `${CashStrategy.name}.${this.processCardOrder.name}`;
    const payment = {
      paymentMethod: PaymentMethod.CASH,
      amount: cardOrder.totalAmount,
      message: 'Thanh toán thẻ quà tặng bằng tiền mặt',
      userId: cardOrder?.customer?.id,
      transactionId: uuidv4(),
      statusCode: PaymentStatus.COMPLETED,
      statusMessage: PaymentStatus.COMPLETED,
    } as Payment;

    this.paymentRepository.create(payment);
    const createdPayment = await this.paymentRepository.save(payment);
    this.logger.log(`Payment created with id: ${createdPayment.id}`, context);

    return createdPayment;
  }
}
