import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPaymentStrategy } from './payment.strategy';
import { Payment } from '../entity/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentMethod, PaymentStatus } from '../payment.constants';
import { Order } from 'src/order/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreditCardStrategy implements IPaymentStrategy {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async process(order: Order): Promise<Payment> {
    const context = `${CreditCardStrategy.name}.${this.process.name}`;
    const payment = {
      paymentMethod: PaymentMethod.CREDIT_CARD,
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
}
