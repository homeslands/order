import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchRevenue } from './branch-revenue.entity';
import { DataSource, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getAllBranchRevenueClause, getCurrentBranchRevenueClause, getYesterdayBranchRevenueClause } from './branch-revenue.clause';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { BranchRevenueQueryResponseDto } from './branch-revenue.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { plainToInstance } from 'class-transformer';
import { BranchRevenueException } from './branch-revenue.exception';
import { BranchRevenueValidation } from './branch-revenue.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import * as _ from 'lodash';
import { Branch } from 'src/branch/branch.entity';
import { BranchRevenueService } from './branch-revenue.service';

@Injectable()
export class BranchRevenueScheduler {
  constructor(
    @InjectRepository(BranchRevenue)
    private readonly branchRevenueRepository: Repository<BranchRevenue>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly dataSource: DataSource,
    private readonly branchRevenueService: BranchRevenueService,
    private readonly transactionManagerService: TransactionManagerService,
    
  ) {}

  @Timeout(5000)
    async initBranchRevenue() {
      const context = `${BranchRevenueScheduler.name}.${this.initBranchRevenue.name}`;
      const hasBranchRevenue = await this.branchRevenueRepository.find();
  
      if (!_.isEmpty(hasBranchRevenue)) {
        this.logger.error(`Branch revenue already exists`, null, context);
        return;
      }
  
      // handle the date have not payment
      const results: BranchRevenueQueryResponseDto[] =
        await this.branchRevenueRepository.query(getAllBranchRevenueClause);
  
        // console.log({results})
      const branchRevenues = results.map((item) => {
        return this.mapper.map(item, BranchRevenueQueryResponseDto, BranchRevenue);
      });
      // console.log({branchRevenues})

      const groupedDatasByBranch = this.groupRevenueByBranch(branchRevenues);
      // console.log({groupedDatasByBranch})
      
      let revenuesFillZero: BranchRevenue[] = [];
      for(const groupedDataByBranch of groupedDatasByBranch) {
        // console.log({groupedDataByBranch})
        const revenueFillZero: BranchRevenue[] = this.fillZeroForEmptyDate(groupedDataByBranch)
        revenuesFillZero = revenuesFillZero.concat(revenueFillZero);
      }
      // console.log({revenuesFillZero});

      this.transactionManagerService.execute(
        async (manager) => {
          await manager.save(revenuesFillZero);
        },
        () =>
          this.logger.log(
            `${revenuesFillZero.length} Branch revenues initialized successfully`,
            context,
          ),
        (error) => {
          this.logger.error(
            `An error occurred while initializing branch revenues: ${JSON.stringify(error)}`,
            error.stack,
            context,
          );
          throw new BranchRevenueException(
            BranchRevenueValidation.CREATE_BRANCH_REVENUE_ERROR,
            error.message,
          );
        },
      );
    }

    groupRevenueByBranch(
      branchRevenues: BranchRevenue[]
    ): BranchRevenue[][] {
      const groupedData = branchRevenues.reduce((acc, item) => {
        const branchGroup = acc.find(group => group.branchId === item.branchId);
        if (branchGroup) {
          branchGroup.items.push(item);
        } else {
          acc.push({ branchId: item.branchId, items: [item] });
        }
        return acc;
      }, []);
      
      const result = groupedData.map(group => group.items);
      return result;
    }
  
    fillZeroForEmptyDate(branchRevenues: BranchRevenue[]): BranchRevenue[] {
      if(_.isEmpty(branchRevenues)) return;
  
      // if only have data in current date
      if(branchRevenues.length === 1 
        && _.last(branchRevenues).date.getTime() === (new Date()).setHours(7, 0, 0, 0)) return;

      const firstBranchRevenue = _.first(branchRevenues);
  
      const firstRevenue = _.first(branchRevenues);
      const firstDate = new Date(firstRevenue.date);
      const lastDate = new Date();
      lastDate.setDate(lastDate.getDate() - 1);
      lastDate.setHours(30, 59, 59, 999);
  
      const datesInRange: Date[] = [];
      let currentDate = new Date(firstDate);
  
      while (currentDate <= lastDate) {
        datesInRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      const results: BranchRevenue[] = [];
  
      datesInRange.forEach(dateFull => {
        const matchingDate = 
          branchRevenues.find(item => item.date.getTime() === dateFull.getTime());
  
        if (matchingDate) {
          results.push(matchingDate);
        } else {
          const revenue = new BranchRevenue();
          Object.assign(revenue, {
            totalAmount: 0,
            totalOrder: 0,
            date: dateFull,
            branchId: firstBranchRevenue.branchId
          });
          results.push(revenue);
        }
      });
  
      return results;
    }

  // @Cron(CronExpression.EVERY_DAY_AT_1PM)
  // @Timeout(5000)
  async refreshBranchRevenueWhenEmpty() {
    const context = `${BranchRevenue.name}.${this.refreshBranchRevenueWhenEmpty.name}`;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(7,0,0,0);

    // console.log({yesterdayDate})

    const hasBranchRevenues = await this.branchRevenueRepository.find({
      where: { 
        date: yesterdayDate
      }
    });
    // console.log({hasBranchRevenues})
    const branches = await this.branchRepository.find();
    // console.log({branches})
    if(_.size(hasBranchRevenues) >= _.size(branches)) {
      this.logger.log(`Branch revenue for ${yesterdayDate} already exists`, context);
      return;
    }
    
    // const branchIdsFromBranchRevenues = _.map(hasBranchRevenues, 'branchId');
    const branchIdsFromBranchRevenues = hasBranchRevenues.map((item) => item.branchId);
    const branchesDoNotExistBranchRevenues = branches.filter(
      (item) => !_.includes(branchIdsFromBranchRevenues, item.id)
    );

    // console.log({branchesDoNotExistBranchRevenues});

    const results: BranchRevenueQueryResponseDto[] = 
      await this.branchRevenueRepository.query(
        getYesterdayBranchRevenueClause,
      );
    // console.log({results})

    const branchRevenueQueryResponseDtos = plainToInstance(
      BranchRevenueQueryResponseDto,
      results,
    );
    // console.log({branchRevenueQueryResponseDtos})

    const revenues = branchRevenueQueryResponseDtos.map((item) => {
      return this.mapper.map(
        item,
        BranchRevenueQueryResponseDto,
        BranchRevenue,
      );
    });
    // console.log({revenues})

    const newBranchRevenues: BranchRevenue[] = this.getBranchRevenuesToCreate(
      branchesDoNotExistBranchRevenues,
      revenues,
      yesterdayDate
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(newBranchRevenues);
      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue ${new Date().toISOString()} created successfully`,
        context,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error when creating branch revenues: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.CREATE_BRANCH_REVENUE_ERROR,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  getBranchRevenuesToCreate(
    branchesDoNotExistBranchRevenues: Branch[],
    revenues: BranchRevenue[],
    yesterdayDate: Date
  ): BranchRevenue[] {
    const newBranchRevenues: BranchRevenue[] = [];

    branchesDoNotExistBranchRevenues.forEach(branch => {
      const matchRevenue = 
        revenues.find(item => item.branchId === branch.id);

      if(matchRevenue) {
        newBranchRevenues.push(matchRevenue);
      } else {
        const revenue = new BranchRevenue();
        Object.assign(revenue, {
          totalAmount: 0,
          totalOrder: 0,
          date: yesterdayDate,
          branchId: branch.id
        });
        newBranchRevenues.push(revenue);
      }
    });

    // console.log({newBranchRevenues});
    return newBranchRevenues;
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  // @Timeout(5000)
  async refreshBranchRevenueAnyWhen() {
    const context = `${BranchRevenue.name}.${this.refreshBranchRevenueAnyWhen.name}`;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(7,0,0,0);

    // console.log({yesterdayDate})

    const hasBranchRevenues = await this.branchRevenueRepository.find({
      where: { 
        date: yesterdayDate
      }
    });
    // console.log({hasBranchRevenues})
    const branches = await this.branchRepository.find();
    // console.log({branches})
    if(_.size(hasBranchRevenues) > _.size(branches)) {
      this.logger.error(
        BranchRevenueValidation.MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE.message,
        null,
        context
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE
      );
    }
    
    const results: BranchRevenueQueryResponseDto[] = 
      await this.branchRevenueRepository.query(
        getYesterdayBranchRevenueClause,
      );
    // console.log({results})

    const branchRevenueQueryResponseDtos = plainToInstance(
      BranchRevenueQueryResponseDto,
      results,
    );
    // console.log({branchRevenueQueryResponseDtos})

    const revenues = branchRevenueQueryResponseDtos.map((item) => {
      return this.mapper.map(
        item,
        BranchRevenueQueryResponseDto,
        BranchRevenue,
      );
    });
    // console.log({revenues})

    const newBranchRevenues: BranchRevenue[] = 
      await this.branchRevenueService.getBranchRevenueDataToCreateAndUpdate(
        hasBranchRevenues,
        revenues,
        yesterdayDate
      );

    // console.log({newBranchRevenues})

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(newBranchRevenues);
      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue ${new Date().toISOString()} created successfully`,
        context,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error when creating branch revenues: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.CREATE_BRANCH_REVENUE_ERROR,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }
}


