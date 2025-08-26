import { Inject, Injectable, Logger } from '@nestjs/common';
import { Payment } from './payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  ModeCancelQRBankTransfer,
  PaymentMethod,
  PaymentStatus,
} from './payment.constants';
import { BankTransferStrategy } from './strategy/bank-transfer.strategy';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';

@Injectable()
export class PaymentUtils {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly bankTransferStrategy: BankTransferStrategy,
    private readonly systemConfigService: SystemConfigService,
  ) { }

  async getModeCancelQRBankTransfer(): Promise<string> {
    const context = `${PaymentUtils.name}.${this.getModeCancelQRBankTransfer.name}`;
    this.logger.log(`Get mode cancel QR bank transfer`, context);
    const mode = await this.systemConfigService.get(
      SystemConfigKey.MODE_CANCEL_QR_BANK_TRANSFER,
    );
    if (!mode) {
      this.logger.warn(`Mode cancel QR bank transfer not found`, context);
      // Default is apply
      return ModeCancelQRBankTransfer.APPLY;
    }

    return mode;
  }

  async cancelPayment(slug: string) {
    const context = `${PaymentUtils.name}.${this.cancelPayment.name}`;
    this.logger.log(`Cancel payment ${slug}`, context);
    const modeCancelQRBankTransfer = await this.getModeCancelQRBankTransfer();

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
      if (modeCancelQRBankTransfer === ModeCancelQRBankTransfer.APPLY) {
        await this.bankTransferStrategy.cancelQRCode(payment);
      } else {
        this.logger.log(`Mode cancel QR bank transfer is not apply`, context);
      }
    }
    // await this.paymentRepository.softRemove(payment);

    Object.assign(payment, {
      statusCode: PaymentStatus.CANCELLED,
      statusMessage: 'Thanh toan da bi huy',
      deletedAt: new Date(),
    } as Payment);
    await this.paymentRepository.save(payment);

    this.logger.log(`Payment ${slug} has been removed`, context);
  }
}
