import { Inject, Injectable, Logger } from '@nestjs/common';
import { VoucherUtils } from './voucher.utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import moment from 'moment';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class VoucherScheduler {
  constructor(
    private readonly voucherUtils: VoucherUtils,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleActiveVouchers() {
    const context = `${VoucherScheduler.name}.${this.handleActiveVouchers.name}`;
    this.logger.log(`Running active vouchers scheduler`, context);

    const vouchers = await this.voucherRepository.find({});
    const today = new Date(moment().format('YYYY-MM-DD'));
    this.logger.log(`Today: ${today}`, context);

    // Filter vouchers which will be active
    const filterActiveVouchers = vouchers
      .filter((voucher) => {
        return (
          moment(voucher.endDate).isSameOrAfter(today) &&
          moment(voucher.startDate).isSameOrBefore(today) &&
          !voucher.isActive &&
          voucher.remainingUsage > 0
        );
      })
      .map((voucher) => {
        voucher.isActive = true;
        return voucher;
      });

    this.logger.log(`Active vouchers: ${filterActiveVouchers.length}`, context);

    // Active vouchers
    await this.transactionManagerService.execute<void>(
      async (manager) => {
        await manager.save(filterActiveVouchers);
      },
      () => {
        this.logger.log(`Active vouchers scheduler completed.`, context);
      },
      (error) => {
        this.logger.error(
          `Error when running active vouchers scheduler:  ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleInactiveVouchers() {
    const context = `${VoucherScheduler.name}.${this.handleInactiveVouchers.name}`;
    this.logger.log(`Running inactive vouchers scheduler`, context);

    const vouchers = await this.voucherRepository.find({});
    const today = new Date(moment().format('YYYY-MM-DD'));
    this.logger.log(`Today: ${today}`, context);

    // Filter vouchers which will be inactive
    const filterActiveVouchers = vouchers
      .filter((voucher) => {
        return (
          moment(voucher.startDate).isAfter(today) ||
          moment(voucher.endDate).isBefore(today) ||
          voucher.remainingUsage <= 0
        );
      })
      .filter((voucher) => voucher.isActive)
      .map((voucher) => {
        voucher.isActive = false;
        return voucher;
      });

    this.logger.log(
      `Inactive vouchers: ${filterActiveVouchers.length}`,
      context,
    );

    // Inactive vouchers
    await this.transactionManagerService.execute<void>(
      async (manager) => {
        await manager.save(filterActiveVouchers);
      },
      () => {
        this.logger.log(`Inactive vouchers scheduler completed.`, context);
      },
      (error) => {
        this.logger.error(
          `Error when running inactive vouchers scheduler:  ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }
}
