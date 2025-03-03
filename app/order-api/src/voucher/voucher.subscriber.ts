import { Inject, Logger } from '@nestjs/common';
import { Voucher } from './voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  Repository,
  UpdateEvent,
} from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@EventSubscriber()
export class VoucherSubscriber implements EntitySubscriberInterface<Voucher> {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Voucher;
  }

  async afterUpdate(event: UpdateEvent<Voucher>): Promise<void> {
    const context = `${VoucherSubscriber.name}.${this.afterUpdate.name}`;
    const previousVoucher = event.databaseEntity;
    const updatedVoucher = event.entity as Voucher;
    if (!previousVoucher || !updatedVoucher) return;

    if (
      previousVoucher.remainingUsage !== updatedVoucher.remainingUsage &&
      updatedVoucher.remainingUsage <= 0
    ) {
      // Inactive voucher if remaining usage is 0 and voucher is active
      if (updatedVoucher.isActive) {
        this.logger.log(
          `Voucher ${updatedVoucher.id} remaining usage is 0, inactivating voucher`,
          context,
        );

        updatedVoucher.isActive = false;
        await this.transactionManagerService.execute<void>(
          async (manager) => {
            await manager.save(updatedVoucher);
          },
          () => {
            this.logger.log(
              `Voucher ${updatedVoucher.code} inactivated`,
              context,
            );
          },
          (error) => {
            this.logger.error(
              `Error when inactivating voucher ${updatedVoucher.code}: ${error.message}`,
              error.stack,
              context,
            );
          },
        );
      }
    }
  }
}
