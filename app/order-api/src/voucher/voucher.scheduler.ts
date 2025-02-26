import { Injectable } from '@nestjs/common';
import { VoucherUtils } from './voucher.utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VoucherScheduler {
  constructor(
    private readonly voucherUtils: VoucherUtils,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleActiveVouchers() {
    // const vouchers = await this.voucherRepository.find
  }
}
