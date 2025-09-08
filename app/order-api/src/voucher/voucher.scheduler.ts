import { Inject, Injectable, Logger } from '@nestjs/common';
import { VoucherUtils } from './voucher.utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Voucher } from './entity/voucher.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import _ from 'lodash';
import moment from 'moment';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';

@Injectable()
export class VoucherScheduler {
  constructor(
    private readonly voucherUtils: VoucherUtils,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getGracePeriodVoucher() {
    const gracePeriodVoucher = await this.systemConfigService.get(
      SystemConfigKey.GRACE_PERIOD_VOUCHER,
      false,
    );
    if (!gracePeriodVoucher) return 30 * 60 * 1000; // 30 minutes
    return Number(gracePeriodVoucher);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleActiveVouchers() {
    const context = `${VoucherScheduler.name}.${this.handleActiveVouchers.name}`;

    const gracePeriodVoucher = await this.getGracePeriodVoucher();
    const gracePeriodVoucherByMinutes = gracePeriodVoucher / 60000;

    const start = new Date();
    const startCopy = new Date(start);
    const end = moment(startCopy)
      .subtract(gracePeriodVoucherByMinutes, 'minutes')
      .toDate();

    const vouchers = await this.voucherRepository.find({
      where: {
        isActive: false,
        remainingUsage: MoreThan(0),
        endDate: MoreThanOrEqual(end),
        startDate: LessThanOrEqual(start),
      },
    });

    if (_.isEmpty(vouchers)) return;

    // Filter vouchers which will be active
    const filterActiveVouchers = vouchers.map((voucher) => {
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

  @Cron(CronExpression.EVERY_MINUTE)
  async handleInactiveVouchers() {
    const context = `${VoucherScheduler.name}.${this.handleInactiveVouchers.name}`;

    const gracePeriodVoucher = await this.getGracePeriodVoucher();
    const gracePeriodVoucherByMinutes = gracePeriodVoucher / 60000;

    const start = new Date();
    const startCopy = new Date(start);
    const end = moment(startCopy)
      .subtract(gracePeriodVoucherByMinutes, 'minutes')
      .toDate();

    const vouchers = await this.voucherRepository.find({
      where: [
        {
          isActive: true,
          remainingUsage: LessThanOrEqual(0),
        },
        {
          // more soon
          isActive: true,
          startDate: MoreThan(start),
        },
        {
          // expired
          isActive: true,
          endDate: LessThan(end),
        },
      ],
    });

    if (_.isEmpty(vouchers)) return;

    // Filter vouchers which will be inactive
    const filterActiveVouchers = vouchers.map((voucher) => {
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
