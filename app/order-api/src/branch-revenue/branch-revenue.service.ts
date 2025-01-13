import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchRevenue } from './branch-revenue.entity';
import { Between, DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  AggregateBranchRevenueResponseDto,
  BranchRevenueQueryResponseDto,
  BranchRevenueResponseDto,
  GetBranchRevenueQueryDto,
  RefreshSpecificRangeBranchRevenueQueryDto,
} from './branch-revenue.dto';
import { Branch } from 'src/branch/branch.entity';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';
import * as _ from 'lodash';
import { getCurrentBranchRevenueClause, getSpecificRangeBranchRevenueClause } from './branch-revenue.clause';
import { plainToInstance } from 'class-transformer';
import { BranchRevenueException } from './branch-revenue.exception';
import { BranchRevenueValidation } from './branch-revenue.validation';
import moment from 'moment';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class BranchRevenueService {
  constructor(
    @InjectRepository(BranchRevenue)
    private readonly branchRevenueRepository: Repository<BranchRevenue>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  async findAll(
    branchSlug: string, 
    query: GetBranchRevenueQueryDto
  ): Promise<AggregateBranchRevenueResponseDto[]> {
    const context = `${BranchRevenue.name}.${this.findAll.name}`;
    const findOptionsWhere: FindOptionsWhere<BranchRevenue> = {};

    if (branchSlug) {
      const branch = await this.branchRepository.findOne({
        where: {
          slug: branchSlug,
        },
      });
      if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
      findOptionsWhere.branchId = branch.id;
    }

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
            moment(endDate).endOf('days').add(7, 'hours').toDate()
          );
          break;
        case 'month':
          findOptionsWhere.date = Between(
            moment(startDate).startOf('months').add(7, 'hours').toDate(), 
            moment(endDate).endOf('months').add(7, 'hours').toDate()
          );
          break;
        case 'year':
          findOptionsWhere.date = Between(
            moment(startDate).startOf('years').add(7, 'hours').toDate(), 
            moment(endDate).endOf('years').add(7, 'hours').toDate()
          );
          break;
        default:
          findOptionsWhere.date = Between(
            moment(startDate).startOf('days').add(7, 'hours').toDate(), 
            moment(endDate).endOf('days').add(7, 'hours').toDate()
          );
          break;
      }
    }

    // console.log({findOptionsWhere})
    // console.log({findOptionsWhere: findOptionsWhere.date})
    const revenues = await this.branchRevenueRepository.find({
      where: findOptionsWhere,
      order: { date: 'ASC' },
    });

    // return this.mapper.mapArray(
    //   revenues,
    //   BranchRevenue,
    //   BranchRevenueResponseDto,
    // );
    return this.queryBranchRevenueCases(query.type ,revenues);
  }

  queryBranchRevenueCases(type: string, branchRevenues: BranchRevenue[]) {
    switch (type) {
      case 'day':
        return this.aggregateByDay(branchRevenues);
      case 'month':
        return this.aggregateByMonth(branchRevenues);
      case 'year':
        return this.aggregateByYear(branchRevenues);
      default:
        return [];
    }
  }

  private aggregateByDay(branchRevenues: BranchRevenue[]): AggregateBranchRevenueResponseDto[] {
    return this.mapper.mapArray(branchRevenues, BranchRevenue, AggregateBranchRevenueResponseDto);
  }

  private aggregateByMonth(branchRevenues: BranchRevenue[]): AggregateBranchRevenueResponseDto[] {
    const result = branchRevenues.reduce((acc, item) => {
      const date = moment(item.date).startOf('months').add(7, 'hours');
      let index = date.toISOString();
      if (!acc[index]) {
        acc[index] = { 
          date: date.toDate(), 
          totalAmount: 0, 
          totalOrder: 0, 
        };
      }
      acc[index].totalAmount += item.totalAmount;
      acc[index].totalOrder += item.totalOrder;
      return acc;
    }, {} as Record<string, AggregateBranchRevenueResponseDto>);

    const data = Object.values(result)
    return this.mapper.mapArray(
      data, 
      AggregateBranchRevenueResponseDto, 
      AggregateBranchRevenueResponseDto
    );
  }

  private aggregateByYear(branchRevenues: BranchRevenue[]) {
    const result = branchRevenues.reduce((acc, item) => {
      const date = moment(item.date).startOf('years').add(7, 'hours');
      let index = date.toISOString();
      if (!acc[index]) {
        acc[index] = { 
          date: date.toDate(), 
          totalAmount: 0, 
          totalOrder: 0,
        };
      }
      acc[index].totalAmount += item.totalAmount;
      acc[index].totalOrder += item.totalOrder;
      return acc;
    }, {} as Record<string, AggregateBranchRevenueResponseDto>);

    const data = Object.values(result);
    return this.mapper.mapArray(
      data, 
      AggregateBranchRevenueResponseDto, 
      AggregateBranchRevenueResponseDto
    );
  }

  async updateLatestBranchRevenueInCurrentDate() {
    const context = `${BranchRevenue.name}.${this.updateLatestBranchRevenueInCurrentDate.name}`;

    this.denyRefreshBranchRevenueManuallyInTimeAutoRefresh();

    const currentDate = new Date();
    currentDate.setHours(7,0,0,0);

    const hasBranchRevenues = await this.branchRevenueRepository.find({
      where: { 
        date: currentDate
      }
    });
    // console.log({hasBranchRevenues});
    const results: BranchRevenueQueryResponseDto[] = 
      await this.branchRevenueRepository.query(
        getCurrentBranchRevenueClause
      );
  
    const branchRevenueQueryResponseDtos = plainToInstance(
      BranchRevenueQueryResponseDto,
      results,
    );

    const revenues = branchRevenueQueryResponseDtos.map((item) => {
      return this.mapper.map(
        item,
        BranchRevenueQueryResponseDto,
        BranchRevenue,
      );
    });
    // console.log({revenues})
    
    const newBranchRevenues: BranchRevenue[] = 
      await this.getBranchRevenueDataToCreateAndUpdate(
        hasBranchRevenues,
        revenues,
        currentDate
      );

    // console.log({newBranchRevenues})

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(newBranchRevenues);
      await queryRunner.commitTransaction();
      this.logger.log(
        `Branch revenue ${new Date().toISOString()} refreshed successfully`,
        context,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error when refresh branch revenues: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.REFRESH_BRANCH_REVENUE_ERROR,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getBranchRevenueDataToCreateAndUpdate(
    hasBranchRevenues: BranchRevenue[], // existed 
    revenues: BranchRevenue[], // new
    date: Date
  ): Promise<BranchRevenue[]> {
    const newBranchRevenues: BranchRevenue[] = [];
    const branches = await this.branchRepository.find();
    // console.log({branches})
    branches.forEach(branch => {
      const existedBranchRevenue = 
        hasBranchRevenues.find(item => item.branchId === branch.id);

      if(existedBranchRevenue) {
        // already exist in db in this current date

        // exist in
        const existedInNewData = revenues.find(revenue => 
          revenue.branchId === branch.id);
        
        if(existedInNewData) {
          if(
            existedInNewData.totalAmount !== existedBranchRevenue.totalAmount ||
            existedInNewData.totalOrder !== existedBranchRevenue.totalOrder
          ) {
            Object.assign(existedBranchRevenue, existedInNewData);
            newBranchRevenues.push(existedBranchRevenue);
          }
        }  
      } else {
        // do not exist in db

        // find in new data
        const existedInNewData = revenues.find(revenue => 
          revenue.branchId === branch.id);
        
        if(existedInNewData) {
          newBranchRevenues.push(existedInNewData);
        } else {
          // do not find in new data
          const newRevenue = new BranchRevenue();
          Object.assign(newRevenue, {
            totalAmount: 0,
            totalOrder: 0,
            date,
            branchId: branch.id
          });
          newBranchRevenues.push(newRevenue);
        }
      }
    });

    return newBranchRevenues;
  }

  denyRefreshBranchRevenueManuallyInTimeAutoRefresh() {
    const context = `${BranchRevenueService.name}.${this.denyRefreshBranchRevenueManuallyInTimeAutoRefresh.name}`;
    const currentMoment = moment();
    const currentHour = currentMoment.hour();

    if(currentHour >= 0 && currentHour <= 2) {
      this.logger.error(
        BranchRevenueValidation.CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H.message,
        null,
        context
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H      
      )
    }
  }

  async refreshBranchRevenueForSpecificDay(
    query: RefreshSpecificRangeBranchRevenueQueryDto
  ) {
    const context = `${BranchRevenueService.name}.${this.refreshBranchRevenueForSpecificDay.name}`;

    this.denyRefreshBranchRevenueManuallyInTimeAutoRefresh();

    if(query.startDate.getTime() > query.endDate.getTime()) {
      this.logger.warn(
        BranchRevenueValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE.message,
        context
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE
      );
    }

    const startQuery = moment(query.startDate).format("YYYY-MM-DD");
    const endQuery = moment(query.endDate).add(1, 'days').format("YYYY-MM-DD");
    
    const startDate = new Date(query.startDate);
    startDate.setHours(7,0,0,0);
    const endDate = new Date(query.endDate);
    endDate.setHours(30,59,59,99);

    const params = [startQuery, endQuery];
    const results: BranchRevenueQueryResponseDto[] =
      await this.branchRevenueRepository.query(getSpecificRangeBranchRevenueClause, params);

    const branchRevenues = results.map((item) => {
      return this.mapper.map(item, BranchRevenueQueryResponseDto, BranchRevenue);
    });

    const groupedDatasByBranch = 
      this.groupRevenueByBranch(branchRevenues);
    
    const branches = await this.branchRepository.find();

    let createAndUpdateBranchRevenues: BranchRevenue[] = [];

    for (const branch of branches) {
      const hasBranchRevenues = await this.branchRevenueRepository.find({
        where: {
          branchId: branch.id,
          date: Between(startDate, endDate)
        },
      });

      const branchRevenue = groupedDatasByBranch.find(
        groupedData => groupedData.branchId === branch.id
      );

      let branchRevenueFillZero: BranchRevenue[] = [];
      if(branchRevenue) {
        branchRevenueFillZero = this.fillZeroForEmptyDate(
          branch.id,
          branchRevenue.items,
          startDate,
          endDate
        );
      } else {
        branchRevenueFillZero = this.fillZeroForEmptyDate(
          branch.id,
          [],
          startDate,
          endDate
        );
      }

      // if(branch.id === '8ba67f04-0f1e-492d-b7d3-a301faad7de6') {
      //   console.log({branchRevenue: branchRevenue.items[0]})
      //   console.log({branchRevenue: branchRevenue.items[1]})
      // }

      const createAndUpdateBranchRevenue: BranchRevenue[] = 
        this.getCreateAndUpdateRevenuesInRangeDays(
          hasBranchRevenues,
          branchRevenueFillZero,
        );
      createAndUpdateBranchRevenues = 
        createAndUpdateBranchRevenues.concat(createAndUpdateBranchRevenue);
    };

    this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(createAndUpdateBranchRevenues);
      },
      () =>
        this.logger.log(
          `${createAndUpdateBranchRevenues.length} branch revenues from ${moment(query.startDate).format("YYYY-MM-DD")} 
            to ${moment(query.endDate).format("YYYY-MM-DD")} updated successfully`,
          context,
        ),
      (error) => {
        this.logger.error(
          `Error when update revenues: ${JSON.stringify(error)}`,
          error.stack,
          context,
        );
        throw new BranchRevenueException(
          BranchRevenueValidation.REFRESH_BRANCH_REVENUE_ERROR,
          error.message,
        );
      },
    );
  }

  fillZeroForEmptyDate(
    branchId: string,
    revenues: BranchRevenue[],
    firstDate: Date,
    lastDate: Date
  ): BranchRevenue[] {
    const datesInRange: Date[] = [];
    let currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      datesInRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const results: BranchRevenue[] = [];

    datesInRange.forEach(dateFull => {
      const matchingElement = revenues.find(
        item => item.date.getTime() === dateFull.getTime()
      );

      if (matchingElement) {
        results.push(matchingElement);
      } else {
        const revenue = new BranchRevenue();
        Object.assign(revenue, {
          totalAmount: 0,
          totalOrder: 0,
          date: dateFull,
          branchId
        });
        results.push(revenue);
      }
    });

    return results;
  }

  groupRevenueByBranch(
    branchRevenues: BranchRevenue[]
  ): {
    branchId: string;
    items: BranchRevenue[]
  }[] {
    const groupedData = branchRevenues.reduce((acc, item) => {
      const branchGroup = acc.find(group => group.branchId === item.branchId);
      if (branchGroup) {
        branchGroup.items.push(item);
      } else {
        acc.push({ branchId: item.branchId, items: [item] });
      }
      return acc;
    }, []);

    return groupedData;
    // console.log({groupedData})
    // console.log({groupedData: groupedData[0].items[0]})
    
    // const result = groupedData.map(group => group.items);
    // return result;
  }

  getCreateAndUpdateRevenuesInRangeDays(
    hasBranchRevenues: BranchRevenue[], // existed
    branchRevenues: BranchRevenue[], // new, have all revenues in range time
  ): BranchRevenue[] {
    if(_.isEmpty(hasBranchRevenues)) return branchRevenues;

    const createAndUpdateBranchRevenues: BranchRevenue[] = [];
    branchRevenues.forEach(newBranchRevenue => {
      const existedBranchRevenue = 
        hasBranchRevenues.find(item => item.date.getTime() === newBranchRevenue.date.getTime());

      if(existedBranchRevenue) {
        if(
          existedBranchRevenue.totalAmount !== newBranchRevenue.totalAmount ||
          existedBranchRevenue.totalOrder !== newBranchRevenue.totalOrder
        ) {
          Object.assign(existedBranchRevenue, newBranchRevenue);
          createAndUpdateBranchRevenues.push(existedBranchRevenue);
        } else {
          // createAndUpdateBranchRevenues.push(existedBranchRevenue)
        }
      } else {
        createAndUpdateBranchRevenues.push(newBranchRevenue);
      }
    });
    return createAndUpdateBranchRevenues;
  }
}
