import { Payment } from '../payment.entity';

export interface IPaymentStrategy {
  process(order: any): Promise<Payment>;
}
