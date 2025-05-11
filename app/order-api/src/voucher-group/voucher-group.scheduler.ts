import { Inject, Injectable } from '@nestjs/common';
// import { VoucherGroup } from './voucher-group.entity';
// import { IsNull } from 'typeorm';
import { Logger } from '@nestjs/common';
// import { Timeout } from '@nestjs/schedule';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class VoucherGroupScheduler {
  constructor(
    private readonly voucherUtils: VoucherUtils,
    private readonly transactionService: TransactionManagerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  // @Timeout(1000)
  // async createVoucherGroupForVouchersHaveNoGroup() {
  //   const context = `${VoucherGroupScheduler.name}.${this.createVoucherGroupForVouchersHaveNoGroup.name}`;
  //   const vouchers = await this.voucherUtils.getBulkVouchers({
  //     where: {
  //       voucherGroup: IsNull(),
  //     },
  //   });

  //   const voucherGroups = [];

  //   for (const voucher of vouchers) {
  //     const voucherGroup = new VoucherGroup();
  //     voucherGroup.title = voucher.title;
  //     voucherGroup.description = voucher.description;
  //     voucherGroup.vouchers = [voucher];
  //     voucherGroups.push(voucherGroup);
  //   }

  //   await this.transactionService.execute(
  //     async (manager) => await manager.save(voucherGroups),
  //     (result) => {
  //       this.logger.log(
  //         `Created ${result.length} voucher groups for ${vouchers.length} vouchers`,
  //         context,
  //       );
  //     },
  //     (error) => {
  //       this.logger.error(
  //         `Failed to create voucher group for ${vouchers.length} vouchers`,
  //         error.stack,
  //         context,
  //       );
  //     },
  //   );
  // }
}
