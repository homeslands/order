import { Payment } from '../entity/payment.entity';

export interface IPaymentStrategy {
  process(order: any): Promise<Payment>;
}
