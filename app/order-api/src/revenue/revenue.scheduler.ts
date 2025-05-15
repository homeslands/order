import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Revenue } from './revenue.entity';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  getAllRevenueClause,
  getYesterdayRevenueClause,
} from './revenue.clause';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { RevenueQueryResponseDto } from './revenue.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { RevenueException } from './revenue.exception';
import { RevenueValidation } from './revenue.validation';
import * as _ from 'lodash';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { RevenueService } from './revenue.service';

@Injectable()
export class RevenueScheduler {
  constructor(
    @InjectRepository(Revenue)
    private readonly revenueRepository: Repository<Revenue>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly revenueService: RevenueService,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  @Timeout(5000)
  async initRevenue() {
    const context = `${RevenueScheduler.name}.${this.initRevenue.name}`;
    const hasRevenue = await this.revenueRepository.find();

    // handle the date have not payment
    const results: RevenueQueryResponseDto[] =
      await this.revenueRepository.query(getAllRevenueClause);

    const revenues = results.map((item) => {
      return this.mapper.map(item, RevenueQueryResponseDto, Revenue);
    });

    const revenuesFillZero: Revenue[] = this.fillZeroForEmptyDate(revenues);
    if (!_.isEmpty(hasRevenue)) {
      this.logger.error(`Revenue already exists`, null, context);
      return;
    }
    this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(revenuesFillZero);
      },
      () =>
        this.logger.log(
          `${revenuesFillZero.length} revenues initialized successfully`,
          context,
        ),
      (error) => {
        this.logger.error(
          `An error occurred while initializing revenues: ${JSON.stringify(error)}`,
          error.stack,
          context,
        );
      },
    );
  }

  fillZeroForEmptyDate(revenues: Revenue[]): Revenue[] {
    if (_.isEmpty(revenues)) return [];

    // if only have data in current date
    if (
      revenues.length === 1 &&
      _.last(revenues).date.getTime() === new Date().setHours(7, 0, 0, 0)
    )
      return [];

    const firstRevenue = _.first(revenues);
    const firstDate = new Date(firstRevenue.date);
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - 1);
    lastDate.setHours(30, 59, 59, 999);

    const datesInRange: Date[] = [];
    const currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      datesInRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const results: Revenue[] = [];

    datesInRange.forEach((dateFull) => {
      const matchingElement = revenues.find(
        (item) => item.date.getTime() === dateFull.getTime(),
      );

      if (matchingElement) {
        results.push(matchingElement);
      } else {
        const revenue = new Revenue();
        Object.assign(revenue, {
          totalAmount: 0,
          totalOrder: 0,
          date: dateFull,
        });
        results.push(revenue);
      }
    });

    return results;
  }

  async refreshRevenueWhenEmpty() {
    const context = `${RevenueScheduler.name}.${this.refreshRevenueWhenEmpty.name}`;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(7, 0, 0, 0);
    const hasRevenue = await this.revenueRepository.find({
      where: {
        date: yesterdayDate,
      },
    });

    if (!_.isEmpty(hasRevenue)) {
      this.logger.log(`Revenue for ${yesterdayDate} already exists`, context);
      return;
    }

    const results: RevenueQueryResponseDto[] =
      await this.revenueRepository.query(getYesterdayRevenueClause);
    const revenues = results.map((item) => {
      return this.mapper.map(item, RevenueQueryResponseDto, Revenue);
    });

    if (_.isEmpty(revenues)) {
      const revenue = new Revenue();
      Object.assign(revenue, {
        totalAmount: 0,
        totalOrder: 0,
        date: yesterdayDate,
      });

      revenues.push(revenue);
    }

    this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(revenues);
      },
      () =>
        this.logger.log(
          `${revenues.length} revenues created successfully`,
          context,
        ),
      (error) => {
        this.logger.error(
          `Error when creating revenues: ${JSON.stringify(error)}`,
          error.stack,
          context,
        );
        throw new RevenueException(
          RevenueValidation.CREATE_REVENUE_ERROR,
          error.message,
        );
      },
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async refreshRevenueAnyWhen() {
    const context = `${RevenueScheduler.name}.${this.refreshRevenueAnyWhen.name}`;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(7, 0, 0, 0);
    const hasRevenues = await this.revenueRepository.find({
      where: {
        date: yesterdayDate,
      },
    });

    if (_.size(hasRevenues) > 1) {
      this.logger.error(
        RevenueValidation.DUPLICATE_RECORD_REVENUE_ONE_DAY_IN_DATABASE.message,
        null,
        context,
      );
      throw new RevenueException(
        RevenueValidation.DUPLICATE_RECORD_REVENUE_ONE_DAY_IN_DATABASE,
      );
    }

    const results: RevenueQueryResponseDto[] =
      await this.revenueRepository.query(getYesterdayRevenueClause);

    // revenues has only one element
    const revenues = results.map((item) => {
      return this.mapper.map(item, RevenueQueryResponseDto, Revenue);
    });
    const createAndUpdateRevenues: Revenue[] =
      this.revenueService.getCreateAndUpdateRevenues(
        hasRevenues,
        revenues,
        yesterdayDate,
      );

    this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(createAndUpdateRevenues);
      },
      () =>
        this.logger.log(
          `${createAndUpdateRevenues.length} revenues created successfully`,
          context,
        ),
      (error) => {
        this.logger.error(
          `Error when creating revenues: ${JSON.stringify(error)}`,
          error.stack,
          context,
        );
        throw new RevenueException(
          RevenueValidation.CREATE_REVENUE_ERROR,
          error.message,
        );
      },
    );
  }
}
