import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GiftCard } from './entities/gift-card.entity';
import { MoreThan, Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GiftCardStatus } from './gift-card.enum';
import _ from 'lodash';

@Injectable()
export class GiftCardScheduler {
  /**
   *
   */
  constructor(
    @InjectRepository(GiftCard)
    private readonly gcRepository: Repository<GiftCard>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
  ) {}

  // @Cron(CronExpression.EVERY_2_HOURS)
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleExpiration() {
    const context = `${GiftCardScheduler.name}.${this.handleExpiration.name}`;

    const gcs = await this.gcRepository.find({
      where: {
        status: GiftCardStatus.AVAILABLE,
        expiredAt: MoreThan(new Date()),
      },
    });

    if (_.isEmpty(gcs)) return;

    this.logger.log(
      `Handle gift card expiration req: ${gcs.map((item) => item.slug).join(', ')}`,
      context,
    );

    gcs.forEach((item) => (item.status = GiftCardStatus.EXPIRED));

    await this.transactionService.execute<GiftCard[]>(
      async (manager) => {
        return await manager.save(gcs);
      },
      (res) => {
        this.logger.error(`${res.length} gift cards expired`, context);
      },
      (err) => {
        this.logger.error(
          `Error when handling gift card expiration: ${err.message}`,
          err.stack,
          context,
        );
      },
    );
  }
}
