import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Revenue } from './revenue.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  AggregateRevenueResponseDto,
  GetRevenueQueryDto,
  RefreshSpecificRangeRevenueQueryDto,
  RevenueQueryResponseDto,
} from './revenue.dto';
import * as _ from 'lodash';
import {
  getCurrentRevenueClause,
  getSpecificRangeRevenueClause,
} from './revenue.clause';
import { RevenueValidation } from './revenue.validation';
import { RevenueException } from './revenue.exception';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import moment from 'moment';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(Revenue)
    private readonly revenueRepository: Repository<Revenue>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  async findAll(query: GetRevenueQueryDto) {
    const context = `${Revenue.name}.${this.findAll.name}`;
    const findOptionsWhere: FindOptionsWhere<Revenue> = {};

    let startDate: Date;
    let endDate: Date;

    if (!query.startDate && !query.endDate) {
      findOptionsWhere.date = null;
    } else {
      // Query from start date to current date
      if (query.startDate && !query.endDate) {
        const currentDate = new Date();
        startDate = query.startDate;
        endDate = currentDate;
        // findOptionsWhere.date = Between(query.startDate, currentDate);
      }

      // Query from start date to end date
      if (query.startDate && query.endDate) {
        startDate = query.startDate;
        endDate = query.endDate;
        // findOptionsWhere.date = Between(query.startDate, query.endDate);
      }

      // Throw exception if start date is not provided
      if (!query.startDate && query.endDate) {
        this.logger.error(`Start date is not provided`, null, context);
        throw new BadRequestException(`Start date must be provided`);
      }

      switch (query.type) {
        case 'day':
          findOptionsWhere.date = Between(
            moment(startDate).startOf('days').add(7, 'hours').toDate(),
            moment(endDate).endOf('days').add(7, 'hours').toDate(),
          );
          break;
        case 'month':
          findOptionsWhere.date = Between(
            moment(startDate).startOf('months').add(7, 'hours').toDate(),
            moment(endDate).endOf('months').add(7, 'hours').toDate(),
          );
          break;
        case 'year':
          findOptionsWhere.date = Between(
            moment(startDate).startOf('years').add(7, 'hours').toDate(),
            moment(endDate).endOf('years').add(7, 'hours').toDate(),
          );
          break;
        default:
          findOptionsWhere.date = Between(
            moment(startDate).startOf('days').add(7, 'hours').toDate(),
            moment(endDate).endOf('days').add(7, 'hours').toDate(),
          );
          break;
      }
    }

    const revenues = await this.revenueRepository.find({
      where: findOptionsWhere,
      order: { date: 'ASC' },
    });

    return this.queryRevenueCases(query.type, revenues);
    // return this.mapper.mapArray(revenues, Revenue, RevenueResponseDto);
  }

  queryRevenueCases(type: string, revenues: Revenue[]) {
    switch (type) {
      case 'day':
        return this.aggregateByDay(revenues);
      case 'month':
        return this.aggregateByMonth(revenues);
      case 'year':
        return this.aggregateByYear(revenues);
      default:
        return [];
    }
  }

  private aggregateByDay(revenues: Revenue[]): AggregateRevenueResponseDto[] {
    return this.mapper.mapArray(revenues, Revenue, AggregateRevenueResponseDto);
  }

  private aggregateByMonth(revenues: Revenue[]): AggregateRevenueResponseDto[] {
    const result = revenues.reduce(
      (acc, item) => {
        const date = moment(item.date).startOf('months').add(7, 'hours');
        const index = date.toISOString();
        if (!acc[index]) {
          acc[index] = { date: date.toDate(), totalAmount: 0, totalOrder: 0 };
        }
        acc[index].totalAmount += item.totalAmount;
        acc[index].totalOrder += item.totalOrder;
        return acc;
      },
      {} as Record<string, AggregateRevenueResponseDto>,
    );

    const data = Object.values(result);
    return this.mapper.mapArray(
      data,
      AggregateRevenueResponseDto,
      AggregateRevenueResponseDto,
    );
  }

  private aggregateByYear(revenues: Revenue[]) {
    const result = revenues.reduce(
      (acc, item) => {
        const date = moment(item.date).startOf('years').add(7, 'hours');
        const index = date.toISOString();
        if (!acc[index]) {
          acc[index] = { date: date.toDate(), totalAmount: 0, totalOrder: 0 };
        }
        acc[index].totalAmount += item.totalAmount;
        acc[index].totalOrder += item.totalOrder;
        return acc;
      },
      {} as Record<string, AggregateRevenueResponseDto>,
    );

    const data = Object.values(result);
    return this.mapper.mapArray(
      data,
      AggregateRevenueResponseDto,
      AggregateRevenueResponseDto,
    );
  }

  async updateLatestRevenueInCurrentDate() {
    const context = `${RevenueService.name}.${this.updateLatestRevenueInCurrentDate.name}`;

    this.denyRefreshRevenueManuallyInTimeAutoRefresh();

    const currentDate = new Date();
    currentDate.setHours(7, 0, 0, 0);

    const hasRevenues = await this.revenueRepository.find({
      where: {
        date: currentDate,
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
      await this.revenueRepository.query(getCurrentRevenueClause);
    const revenues = results.map((item) => {
      return this.mapper.map(item, RevenueQueryResponseDto, Revenue);
    });

    if (_.isEmpty(revenues)) {
      this.logger.warn(
        RevenueValidation.HAVE_NOT_NEW_REVENUE_IN_CURRENT_DATE.message,
        context,
      );
      throw new RevenueException(
        RevenueValidation.HAVE_NOT_NEW_REVENUE_IN_CURRENT_DATE,
      );
    }

    const createAndUpdateRevenues: Revenue[] = this.getCreateAndUpdateRevenues(
      hasRevenues,
      revenues,
      currentDate,
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

  getCreateAndUpdateRevenues(
    hasRevenues: Revenue[], // existed
    revenues: Revenue[], // new
    date: Date,
  ): Revenue[] {
    const createAndUpdateRevenues: Revenue[] = [];

    if (_.isEmpty(hasRevenues)) {
      // create new revenue for yesterday
      if (_.isEmpty(revenues)) {
        // not found new revenue
        const revenue = new Revenue();
        Object.assign(revenue, {
          totalAmount: 0,
          totalOrder: 0,
          date,
        });

        createAndUpdateRevenues.push(revenue);
      } else {
        // have new revenue
        createAndUpdateRevenues.push(_.first(revenues));
      }
    } else {
      // yesterday revenue already exist, update
      const revenue = _.first(hasRevenues);
      if (
        revenue.totalOrder !== _.first(revenues).totalOrder ||
        revenue.totalAmount !== _.first(revenues).totalAmount
      ) {
        Object.assign(revenue, _.first(revenues));
        createAndUpdateRevenues.push(revenue);
      }
    }
    return createAndUpdateRevenues;
  }

  denyRefreshRevenueManuallyInTimeAutoRefresh() {
    const context = `${RevenueService.name}.${this.denyRefreshRevenueManuallyInTimeAutoRefresh.name}`;
    const currentMoment = moment();
    const currentHour = currentMoment.hour();

    if (currentHour >= 0 && currentHour <= 2) {
      this.logger.error(
        RevenueValidation.CAN_NOT_REFRESH_REVENUE_MANUALLY_FROM_0H_TO_2H
          .message,
        null,
        context,
      );
      throw new RevenueException(
        RevenueValidation.CAN_NOT_REFRESH_REVENUE_MANUALLY_FROM_0H_TO_2H,
      );
    }
  }

  async refreshRevenueForSpecificDay(
    query: RefreshSpecificRangeRevenueQueryDto,
  ) {
    const context = `${RevenueService.name}.${this.refreshRevenueForSpecificDay.name}`;
    this.denyRefreshRevenueManuallyInTimeAutoRefresh();

    if (query.startDate.getTime() > query.endDate.getTime()) {
      this.logger.warn(
        RevenueValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE.message,
        context,
      );
      throw new RevenueException(
        RevenueValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE,
      );
    }

    const startQuery = moment(query.startDate).format('YYYY-MM-DD');
    const endQuery = moment(query.endDate).add(1, 'days').format('YYYY-MM-DD');

    const startDate = new Date(query.startDate);
    startDate.setHours(7, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(30, 59, 59, 99);

    const hasRevenues = await this.revenueRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });

    const params = [startQuery, endQuery];
    const results: RevenueQueryResponseDto[] =
      await this.revenueRepository.query(getSpecificRangeRevenueClause, params);

    const revenues = results.map((item) => {
      return this.mapper.map(item, RevenueQueryResponseDto, Revenue);
    });

    const revenuesFilledEmptyDate = this.fillZeroForEmptyDate(
      revenues,
      startDate,
      endDate,
    );

    const createAndUpdateRevenues: Revenue[] =
      this.getCreateAndUpdateRevenuesInRangeDays(
        hasRevenues,
        revenuesFilledEmptyDate,
      );

    this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(createAndUpdateRevenues);
      },
      () =>
        this.logger.log(
          `${createAndUpdateRevenues.length} revenues from ${moment(query.startDate).format('YYYY-MM-DD')} 
            to ${moment(query.endDate).format('YYYY-MM-DD')} updated successfully`,
          context,
        ),
      (error) => {
        this.logger.error(
          `Error when update revenues: ${JSON.stringify(error)}`,
          error.stack,
          context,
        );
        throw new RevenueException(
          RevenueValidation.UPDATE_REVENUE_ERROR,
          error.message,
        );
      },
    );
  }

  fillZeroForEmptyDate(
    revenues: Revenue[],
    firstDate: Date,
    lastDate: Date,
  ): Revenue[] {
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

  getCreateAndUpdateRevenuesInRangeDays(
    hasRevenues: Revenue[], // existed
    revenues: Revenue[], // new, have all revenues in range time
  ): Revenue[] {
    if (_.isEmpty(hasRevenues)) return revenues;

    const createAndUpdateRevenues: Revenue[] = [];

    revenues.forEach((newRevenue) => {
      const existedRevenue = hasRevenues.find(
        (item) => item.date.getTime() === newRevenue.date.getTime(),
      );

      if (existedRevenue) {
        if (
          existedRevenue.totalAmount !== newRevenue.totalAmount ||
          existedRevenue.totalOrder !== newRevenue.totalOrder
        ) {
          Object.assign(existedRevenue, newRevenue);
          createAndUpdateRevenues.push(existedRevenue);
        }
      } else {
        createAndUpdateRevenues.push(newRevenue);
      }
    });
    return createAndUpdateRevenues;
  }
}
