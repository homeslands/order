import { BadRequestException, Injectable } from '@nestjs/common';
import { Payment } from '../payment.entity';
import { IPaymentStrategy } from './payment.strategy';

@Injectable()
export class InternalStrategy implements IPaymentStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async process(order: any): Promise<Payment> {
    throw new BadRequestException('Method not implemented.');
  }
}
