import { Inject, Injectable, Logger } from '@nestjs/common';
import { Payment } from './payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentMethod, PaymentStatus } from './payment.constants';
import { BankTransferStrategy } from './strategy/bank-transfer.strategy';

@Injectable()
export class PaymentUtils {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly bankTransferStrategy: BankTransferStrategy,
  ) {}

  async cancelPayment(slug: string) {
    const context = `${PaymentUtils.name}.${this.cancelPayment.name}`;
    this.logger.log(`Cancel payment ${slug}`, context);
    const payment = await this.paymentRepository.findOne({
      where: {
        slug,
      },
    });
    if (!payment) {
      this.logger.error(`Payment ${slug} not found`, context);
      return;
    }
    if (payment.statusCode !== PaymentStatus.PENDING) {
      this.logger.error(`Payment ${slug} is not pending`, context);
      return;
    }

    if (payment.paymentMethod === PaymentMethod.BANK_TRANSFER) {
      await this.bankTransferStrategy.cancelQRCode(payment);
    }
    await this.paymentRepository.softRemove(payment);
    this.logger.log(`Payment ${slug} has been removed`, context);
  }
}
