import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchRevenue } from './branch-revenue.entity';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  AggregateBranchRevenueResponseDto,
  BranchRevenueQueryResponseDto,
  BranchRevenueQueryResponseForHourDto,
  ExportBranchRevenueQueryDto,
  ExportHandOverTicketRequestDto,
  GetBranchRevenueQueryDto,
  RefreshSpecificRangeBranchRevenueQueryDto,
} from './branch-revenue.dto';
import { Branch } from 'src/branch/branch.entity';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';
import * as _ from 'lodash';
import {
  getCurrentBranchRevenueClause,
  getSpecificRangeBranchRevenueByHourClause,
  getSpecificRangeBranchRevenueClause,
} from './branch-revenue.clause';
import { plainToInstance } from 'class-transformer';
import { BranchRevenueException } from './branch-revenue.exception';
import { BranchRevenueValidation } from './branch-revenue.validation';
import moment from 'moment';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { BranchUtils } from 'src/branch/branch.utils';
import { FileService } from 'src/file/file.service';
import ExcelJS from 'exceljs';
import {
  RevenueTypeExport,
  RevenueTypeQuery,
} from 'src/revenue/revenue.constant';
import { PdfService } from 'src/pdf/pdf.service';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Order } from 'src/order/order.entity';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { OrderUtils } from 'src/order/order.utils';

@Injectable()
export class BranchRevenueService {
  constructor(
    @InjectRepository(BranchRevenue)
    private readonly branchRevenueRepository: Repository<BranchRevenue>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly branchUtils: BranchUtils,
    private readonly fileService: FileService,
    private readonly pdfService: PdfService,
    private readonly qrCodeService: QrCodeService,
    private readonly orderUtils: OrderUtils,
  ) {}

  async findAll(
    branchSlug: string,
    query: GetBranchRevenueQueryDto,
  ): Promise<AggregateBranchRevenueResponseDto[]> {
    const context = `${BranchRevenue.name}.${this.findAll.name}`;
    this.logger.log('query', JSON.stringify(query), context);
    if (query.type === RevenueTypeQuery.HOUR) {
      this.logger.log('Get branch revenue by hour', context);
      if (!query.startDate || !query.endDate) {
        this.logger.error(
          BranchRevenueValidation.START_DATE_AND_END_DATE_MUST_BE_PROVIDED
            .message,
          null,
          context,
        );
        throw new BranchRevenueException(
          BranchRevenueValidation.START_DATE_AND_END_DATE_MUST_BE_PROVIDED,
        );
      }
      const branch = await this.branchRepository.findOne({
        where: {
          slug: branchSlug ?? IsNull(),
        },
      });
      if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);

      const startDateQuery = moment(query.startDate).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      const endDateQuery = moment(query.endDate).format('YYYY-MM-DD HH:mm:ss');

      this.logger.log('startDateQuery', startDateQuery, context);
      this.logger.log('endDateQuery', endDateQuery, context);
      const results: BranchRevenueQueryResponseForHourDto[] =
        await this.branchRevenueRepository.query(
          getSpecificRangeBranchRevenueByHourClause,
          [startDateQuery, endDateQuery, branch.id],
        );

      const fullData = await this.fillMissingDataByHours(
        results,
        query.startDate,
        query.endDate,
      );

      this.logger.log('Get branch revenue by hour success', context);
      const fullDataDto = this.mapper.mapArray(
        fullData,
        BranchRevenue,
        AggregateBranchRevenueResponseDto,
      );
      return fullDataDto;
    } else {
      const findOptionsWhere: FindOptionsWhere<BranchRevenue> = {};

      if (branchSlug) {
        const branch = await this.branchRepository.findOne({
          where: {
            slug: branchSlug,
          },
        });
        if (!branch)
          throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
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
          throw new BranchRevenueException(
            BranchRevenueValidation.START_DATE_IS_NOT_EMPTY,
          );
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
      return this.queryBranchRevenueCases(query.type, revenues);
    }
  }

  async fillMissingDataByHours(
    data: BranchRevenueQueryResponseForHourDto[],
    startTime: Date,
    endTime: Date,
  ): Promise<BranchRevenue[]> {
    const start = moment(startTime);
    const end = moment(endTime);

    // Lấy tất cả các giờ trong khoảng thời gian
    const hoursInRange = [];
    const current = start.clone();
    while (current <= end) {
      hoursInRange.push(current.format('YYYY-MM-DD HH:00:00'));
      current.add(1, 'hour');
    }

    const dataMap = new Map(data.map((item) => [item.date, item]));

    const fullData: BranchRevenue[] = [];
    for (const hour of hoursInRange) {
      const dataItem: BranchRevenueQueryResponseForHourDto = dataMap.get(hour);
      if (dataItem) {
        const startDate = moment(hour).startOf('hours').toDate();
        const endDate = moment(hour).endOf('hours').toDate();
        const { minReferenceNumberOrder, maxReferenceNumberOrder } =
          await this.orderUtils.getMinAndMaxReferenceNumberForBranch(
            dataItem.branchId,
            startDate,
            endDate,
          );
        const returnData = this.mapper.map(
          dataItem,
          BranchRevenueQueryResponseForHourDto,
          BranchRevenue,
        );
        Object.assign(returnData, {
          minReferenceNumberOrder,
          maxReferenceNumberOrder,
        });
        fullData.push(returnData);
      } else {
        const item: BranchRevenueQueryResponseForHourDto = {
          date: hour,
          branchId: _.first(data)?.branchId || '',
          totalAmount: '0',
          totalAmountBank: '0',
          totalAmountCash: '0',
          totalAmountInternal: '0',
          totalFinalAmountOrder: '0',
          totalOriginalAmountOrder: '0',
          totalOriginalOrderItemAmount: '0',
          totalFinalOrderItemAmount: '0',
          totalOrder: '0',
          totalOrderCash: '0',
          totalOrderBank: '0',
          totalOrderInternal: '0',
        };
        const returnData = this.mapper.map(
          item,
          BranchRevenueQueryResponseForHourDto,
          BranchRevenue,
        );
        Object.assign(returnData, {
          minReferenceNumberOrder: 0,
          maxReferenceNumberOrder: 0,
        });
        fullData.push(returnData);
      }
    }
    return fullData;
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

  private aggregateByDay(
    branchRevenues: BranchRevenue[],
  ): AggregateBranchRevenueResponseDto[] {
    return this.mapper.mapArray(
      branchRevenues,
      BranchRevenue,
      AggregateBranchRevenueResponseDto,
    );
  }

  private aggregateByMonth(
    branchRevenues: BranchRevenue[],
  ): AggregateBranchRevenueResponseDto[] {
    const result = branchRevenues.reduce(
      (acc, item) => {
        const date = moment(item.date).startOf('months').add(7, 'hours');
        const index = date.toISOString();
        if (!acc[index]) {
          acc[index] = {
            date: date.toDate(),
            totalAmount: 0,
            totalAmountBank: 0,
            totalAmountCash: 0,
            totalAmountInternal: 0,
            totalOrder: 0,
            minReferenceNumberOrder: 0,
            maxReferenceNumberOrder: 0,
            totalOrderCash: 0,
            totalOrderBank: 0,
            totalOrderInternal: 0,
            originalAmount: 0,
            voucherAmount: 0,
            promotionAmount: 0,
          };
        }
        acc[index].totalAmount += item.totalAmount;
        acc[index].totalOrder += item.totalOrder;
        acc[index].totalOrderCash += item.totalOrderCash;
        acc[index].totalOrderBank += item.totalOrderBank;
        acc[index].totalOrderInternal += item.totalOrderInternal;
        acc[index].originalAmount += item.originalAmount;
        acc[index].voucherAmount += item.voucherAmount;
        acc[index].promotionAmount += item.promotionAmount;
        acc[index].totalAmountBank += item.totalAmountBank;
        acc[index].totalAmountCash += item.totalAmountCash;
        acc[index].totalAmountInternal += item.totalAmountInternal;
        return acc;
      },
      {} as Record<string, AggregateBranchRevenueResponseDto>,
    );

    const data = Object.values(result);
    return this.mapper.mapArray(
      data,
      AggregateBranchRevenueResponseDto,
      AggregateBranchRevenueResponseDto,
    );
  }

  private aggregateByYear(branchRevenues: BranchRevenue[]) {
    const result = branchRevenues.reduce(
      (acc, item) => {
        const date = moment(item.date).startOf('years').add(7, 'hours');
        const index = date.toISOString();
        if (!acc[index]) {
          acc[index] = {
            date: date.toDate(),
            totalAmount: 0,
            totalAmountBank: 0,
            totalAmountCash: 0,
            totalAmountInternal: 0,
            totalOrder: 0,
            totalOrderCash: 0,
            totalOrderBank: 0,
            totalOrderInternal: 0,
            originalAmount: 0,
            voucherAmount: 0,
            promotionAmount: 0,
            minReferenceNumberOrder: 0,
            maxReferenceNumberOrder: 0,
          };
        }
        acc[index].totalAmount += item.totalAmount;
        acc[index].totalOrder += item.totalOrder;
        acc[index].totalOrderCash += item.totalOrderCash;
        acc[index].totalOrderBank += item.totalOrderBank;
        acc[index].totalOrderInternal += item.totalOrderInternal;
        acc[index].originalAmount += item.originalAmount;
        acc[index].voucherAmount += item.voucherAmount;
        acc[index].promotionAmount += item.promotionAmount;
        acc[index].totalAmountBank += item.totalAmountBank;
        acc[index].totalAmountCash += item.totalAmountCash;
        acc[index].totalAmountInternal += item.totalAmountInternal;
        return acc;
      },
      {} as Record<string, AggregateBranchRevenueResponseDto>,
    );

    const data = Object.values(result);
    return this.mapper.mapArray(
      data,
      AggregateBranchRevenueResponseDto,
      AggregateBranchRevenueResponseDto,
    );
  }

  async updateLatestBranchRevenueInCurrentDate() {
    const context = `${BranchRevenue.name}.${this.updateLatestBranchRevenueInCurrentDate.name}`;

    this.denyRefreshBranchRevenueManuallyInTimeAutoRefresh();

    const currentDate = new Date();
    currentDate.setHours(7, 0, 0, 0);

    const hasBranchRevenues = await this.branchRevenueRepository.find({
      where: {
        date: currentDate,
      },
    });
    // console.log({hasBranchRevenues});
    const results: BranchRevenueQueryResponseDto[] =
      await this.branchRevenueRepository.query(getCurrentBranchRevenueClause);

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
        currentDate,
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
    date: Date,
  ): Promise<BranchRevenue[]> {
    const newBranchRevenues: BranchRevenue[] = [];
    const branches = await this.branchRepository.find();
    // console.log({branches})
    for (const branch of branches) {
      const existedBranchRevenue = hasBranchRevenues.find(
        (item) => item.branchId === branch.id,
      );

      if (existedBranchRevenue) {
        // already exist in db in this current date

        // exist in
        const existedInNewData = revenues.find(
          (revenue) => revenue.branchId === branch.id,
        );

        if (existedInNewData) {
          if (
            existedInNewData.totalAmount !== existedBranchRevenue.totalAmount ||
            existedInNewData.totalOrder !== existedBranchRevenue.totalOrder ||
            existedInNewData.totalOrderCash !==
              existedBranchRevenue.totalOrderCash ||
            existedInNewData.totalOrderBank !==
              existedBranchRevenue.totalOrderBank ||
            existedInNewData.minReferenceNumberOrder !==
              existedBranchRevenue.minReferenceNumberOrder ||
            existedInNewData.maxReferenceNumberOrder !==
              existedBranchRevenue.maxReferenceNumberOrder ||
            existedInNewData.totalOrderInternal !==
              existedBranchRevenue.totalOrderInternal ||
            existedInNewData.originalAmount !==
              existedBranchRevenue.originalAmount ||
            existedInNewData.voucherAmount !==
              existedBranchRevenue.voucherAmount ||
            existedInNewData.promotionAmount !==
              existedBranchRevenue.promotionAmount ||
            existedInNewData.totalAmountBank !==
              existedBranchRevenue.totalAmountBank ||
            existedInNewData.totalAmountCash !==
              existedBranchRevenue.totalAmountCash ||
            existedInNewData.totalAmountInternal !==
              existedBranchRevenue.totalAmountInternal
          ) {
            Object.assign(existedBranchRevenue, existedInNewData);
            newBranchRevenues.push(existedBranchRevenue);
          }
        }
      } else {
        // do not exist in db

        // find in new data
        const existedInNewData = revenues.find(
          (revenue) => revenue.branchId === branch.id,
        );

        if (existedInNewData) {
          const startDate = moment(existedInNewData.date)
            .startOf('days')
            .toDate();
          const endDate = moment(existedInNewData.date).endOf('day').toDate();
          const { minReferenceNumberOrder, maxReferenceNumberOrder } =
            await this.orderUtils.getMinAndMaxReferenceNumberForBranch(
              existedInNewData.branchId,
              startDate,
              endDate,
            );
          Object.assign(existedInNewData, {
            minReferenceNumberOrder,
            maxReferenceNumberOrder,
          });
          newBranchRevenues.push(existedInNewData);
        } else {
          // do not find in new data
          const newRevenue = new BranchRevenue();
          Object.assign(newRevenue, {
            totalAmount: 0,
            totalOrder: 0,
            minReferenceNumberOrder: 0,
            maxReferenceNumberOrder: 0,
            totalOrderCash: 0,
            totalOrderBank: 0,
            totalOrderInternal: 0,
            originalAmount: 0,
            totalAmountBank: 0,
            totalAmountCash: 0,
            totalAmountInternal: 0,
            voucherAmount: 0,
            promotionAmount: 0,
            date,
            branchId: branch.id,
          });
          newBranchRevenues.push(newRevenue);
        }
      }
    }

    return newBranchRevenues;
  }

  denyRefreshBranchRevenueManuallyInTimeAutoRefresh() {
    const context = `${BranchRevenueService.name}.${this.denyRefreshBranchRevenueManuallyInTimeAutoRefresh.name}`;
    const currentMoment = moment();
    const currentHour = currentMoment.hour();

    if (currentHour >= 0 && currentHour <= 2) {
      this.logger.error(
        BranchRevenueValidation
          .CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H.message,
        null,
        context,
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H,
      );
    }
  }

  async refreshBranchRevenueForSpecificDay(
    query: RefreshSpecificRangeBranchRevenueQueryDto,
  ) {
    const context = `${BranchRevenueService.name}.${this.refreshBranchRevenueForSpecificDay.name}`;

    this.denyRefreshBranchRevenueManuallyInTimeAutoRefresh();

    if (query.startDate.getTime() > query.endDate.getTime()) {
      this.logger.warn(
        BranchRevenueValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE
          .message,
        context,
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE,
      );
    }

    const startQuery = moment(query.startDate).format('YYYY-MM-DD');
    const endQuery = moment(query.endDate).add(1, 'days').format('YYYY-MM-DD');

    const startDate = new Date(query.startDate);
    startDate.setHours(7, 0, 0, 0);
    const endDate = new Date(query.endDate);
    // note
    endDate.setHours(23, 59, 59, 99);
    this.logger.log('refreshBranchRevenueForSpecificDay', context);
    this.logger.log('startQuery: ', startQuery, context);
    this.logger.log('endQuery: ', endQuery, context);

    const params = [startQuery, endQuery];
    const results: BranchRevenueQueryResponseDto[] =
      await this.branchRevenueRepository.query(
        getSpecificRangeBranchRevenueClause,
        params,
      );

    const branchRevenues = results.map((item) => {
      return this.mapper.map(
        item,
        BranchRevenueQueryResponseDto,
        BranchRevenue,
      );
    });

    const groupedDatasByBranch = this.groupRevenueByBranch(branchRevenues);

    const branches = await this.branchRepository.find();

    let createAndUpdateBranchRevenues: BranchRevenue[] = [];

    for (const branch of branches) {
      const hasBranchRevenues = await this.branchRevenueRepository.find({
        where: {
          branchId: branch.id,
          date: Between(startDate, endDate),
        },
      });

      const branchRevenue = groupedDatasByBranch.find(
        (groupedData) => groupedData.branchId === branch.id,
      );

      let branchRevenueFillZero: BranchRevenue[] = [];
      if (branchRevenue) {
        branchRevenueFillZero = await this.fillZeroForEmptyDate(
          branch.id,
          branchRevenue.items,
          startDate,
          endDate,
        );
      } else {
        branchRevenueFillZero = await this.fillZeroForEmptyDate(
          branch.id,
          [],
          startDate,
          endDate,
        );
      }

      const createAndUpdateBranchRevenue: BranchRevenue[] =
        this.getCreateAndUpdateRevenuesInRangeDays(
          hasBranchRevenues,
          branchRevenueFillZero,
        );
      createAndUpdateBranchRevenues = createAndUpdateBranchRevenues.concat(
        createAndUpdateBranchRevenue,
      );
    }

    this.transactionManagerService.execute(
      async (manager) => {
        await manager.save(createAndUpdateBranchRevenues);
      },
      () =>
        this.logger.log(
          `${createAndUpdateBranchRevenues.length} branch revenues from ${moment(query.startDate).format('YYYY-MM-DD')} 
            to ${moment(query.endDate).format('YYYY-MM-DD')} updated successfully`,
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

  async fillZeroForEmptyDate(
    branchId: string,
    revenues: BranchRevenue[],
    firstDate: Date,
    lastDate: Date,
  ): Promise<BranchRevenue[]> {
    const datesInRange: Date[] = [];
    const currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      datesInRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const results: BranchRevenue[] = [];

    for (const dateFull of datesInRange) {
      const matchingElement = revenues.find(
        (item) => item.date.getTime() === dateFull.getTime(),
      );

      if (matchingElement) {
        const startDate = moment(matchingElement.date).startOf('days').toDate();
        const endDate = moment(matchingElement.date).endOf('day').toDate();
        const { minReferenceNumberOrder, maxReferenceNumberOrder } =
          await this.orderUtils.getMinAndMaxReferenceNumberForBranch(
            matchingElement.branchId,
            startDate,
            endDate,
          );
        Object.assign(matchingElement, {
          minReferenceNumberOrder,
          maxReferenceNumberOrder,
        });
        results.push(matchingElement);
      } else {
        const revenue = new BranchRevenue();
        Object.assign(revenue, {
          totalAmount: 0,
          totalOrder: 0,
          minReferenceNumberOrder: 0,
          maxReferenceNumberOrder: 0,
          totalOrderCash: 0,
          totalOrderBank: 0,
          totalOrderInternal: 0,
          originalAmount: 0,
          totalAmountBank: 0,
          totalAmountCash: 0,
          totalAmountInternal: 0,
          voucherAmount: 0,
          promotionAmount: 0,
          date: dateFull,
          branchId,
        });
        results.push(revenue);
      }
    }

    return results;
  }

  groupRevenueByBranch(branchRevenues: BranchRevenue[]): {
    branchId: string;
    items: BranchRevenue[];
  }[] {
    const groupedData = branchRevenues.reduce((acc, item) => {
      const branchGroup = acc.find((group) => group.branchId === item.branchId);
      if (branchGroup) {
        branchGroup.items.push(item);
      } else {
        acc.push({ branchId: item.branchId, items: [item] });
      }
      return acc;
    }, []);

    return groupedData;
  }

  getCreateAndUpdateRevenuesInRangeDays(
    hasBranchRevenues: BranchRevenue[], // existed
    branchRevenues: BranchRevenue[], // new, have all revenues in range time
  ): BranchRevenue[] {
    if (_.isEmpty(hasBranchRevenues)) return branchRevenues;

    const createAndUpdateBranchRevenues: BranchRevenue[] = [];
    branchRevenues.forEach((newBranchRevenue) => {
      const existedBranchRevenue = hasBranchRevenues.find(
        (item) => item.date.getTime() === newBranchRevenue.date.getTime(),
      );

      if (existedBranchRevenue) {
        if (
          existedBranchRevenue.totalAmount !== newBranchRevenue.totalAmount ||
          existedBranchRevenue.totalOrder !== newBranchRevenue.totalOrder ||
          existedBranchRevenue.minReferenceNumberOrder !==
            newBranchRevenue.minReferenceNumberOrder ||
          existedBranchRevenue.maxReferenceNumberOrder !==
            newBranchRevenue.maxReferenceNumberOrder ||
          existedBranchRevenue.totalOrderCash !==
            newBranchRevenue.totalOrderCash ||
          existedBranchRevenue.totalOrderBank !==
            newBranchRevenue.totalOrderBank ||
          existedBranchRevenue.totalOrderInternal !==
            newBranchRevenue.totalOrderInternal ||
          existedBranchRevenue.originalAmount !==
            newBranchRevenue.originalAmount ||
          existedBranchRevenue.voucherAmount !==
            newBranchRevenue.voucherAmount ||
          existedBranchRevenue.promotionAmount !==
            newBranchRevenue.promotionAmount ||
          existedBranchRevenue.totalAmountBank !==
            newBranchRevenue.totalAmountBank ||
          existedBranchRevenue.totalAmountCash !==
            newBranchRevenue.totalAmountCash ||
          existedBranchRevenue.totalAmountInternal !==
            newBranchRevenue.totalAmountInternal
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

  async exportBranchRevenueToExcel(requestData: ExportBranchRevenueQueryDto) {
    const context = `${BranchRevenueService.name}.${this.exportBranchRevenueToExcel.name}`;
    this.logger.log('Start exporting branch revenue to Excel', context);

    let isFormatDateHaveHour = false;
    try {
      const branch = await this.branchUtils.getBranch({
        where: { slug: requestData.branch },
      });
      // Query data from database
      let branchRevenues: BranchRevenue[] = [];

      if (requestData.type === RevenueTypeExport.DAY) {
        isFormatDateHaveHour = false;
        this.logger.log('startDateQuery', requestData.startDate);
        this.logger.log('endDateQuery', requestData.endDate);
        branchRevenues = await this.branchRevenueRepository.find({
          where: {
            branchId: branch.id,
            date: Between(requestData.startDate, requestData.endDate),
          },
          order: {
            date: 'ASC',
          },
        });
      } else if (requestData.type === RevenueTypeExport.HOUR) {
        isFormatDateHaveHour = true;
        const startDateQuery = moment(requestData.startDate).format(
          'YYYY-MM-DD HH:mm:ss',
        );
        const endDateQuery = moment(requestData.endDate).format(
          'YYYY-MM-DD HH:mm:ss',
        );

        this.logger.log('requestData.startDate', requestData.startDate);
        this.logger.log('requestData.endDate', requestData.endDate);
        this.logger.log('startDateQuery', startDateQuery);
        this.logger.log('endDateQuery', endDateQuery);
        const results: BranchRevenueQueryResponseForHourDto[] =
          await this.branchRevenueRepository.query(
            getSpecificRangeBranchRevenueByHourClause,
            [startDateQuery, endDateQuery, branch.id],
          );

        branchRevenues = await this.fillMissingDataByHours(
          results,
          requestData.startDate,
          requestData.endDate,
        );
      }

      const cellData: {
        cellPosition: string;
        value: string | number;
        type: string;
        style?: Partial<ExcelJS.Style>;
      }[] = [];

      cellData.push(
        {
          cellPosition: `B2`,
          value: branch.name.toString(),
          type: 'data',
        },
        {
          cellPosition: `B3`,
          value: branch.address,
          type: 'data',
        },
        {
          cellPosition: `B4`,
          value: isFormatDateHaveHour
            ? moment(requestData.startDate).format('DD/MM/YYYY HH:mm:ss')
            : moment(requestData.startDate).format('DD/MM/YYYY'),
          type: 'data',
        },
        {
          cellPosition: `B5`,
          value: isFormatDateHaveHour
            ? moment(requestData.endDate).format('DD/MM/YYYY HH:mm:ss')
            : moment(requestData.endDate).format('DD/MM/YYYY'),
          type: 'data',
        },
        {
          cellPosition: `B6`,
          value: isFormatDateHaveHour
            ? moment().format('DD/MM/YYYY HH:mm:ss')
            : moment().format('DD/MM/YYYY'),
          type: 'data',
        },
      );

      // Add data rows
      let totalOriginalAmount = 0;
      let totalPromotionAmount = 0;
      let totalVoucherAmount = 0;
      let totalAmount = 0;
      let totalOrder = 0;
      let totalAmountBank = 0;
      let totalAmountCash = 0;
      let totalAmountInternal = 0;

      // Start from row 9 (below header row)
      let currentRow = 9;
      const cellStyle: Partial<ExcelJS.Style> = {
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        },
      };

      branchRevenues.forEach((revenue, index) => {
        cellData.push(
          {
            cellPosition: `A${currentRow}`,
            value: (index + 1).toString(),
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `B${currentRow}`,
            value: isFormatDateHaveHour
              ? moment(revenue.date).format('DD/MM/YYYY HH:mm:ss')
              : moment(revenue.date).format('DD/MM/YYYY'),
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `C${currentRow}`,
            value: revenue.totalOrder,
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `D${currentRow}`,
            value: revenue.originalAmount,
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `E${currentRow}`,
            value: revenue.promotionAmount,
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `F${currentRow}`,
            value: revenue.voucherAmount,
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `G${currentRow}`,
            value: '',
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `H${currentRow}`,
            value: revenue.totalAmount,
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `I${currentRow}`,
            value: revenue.totalAmountCash,
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `J${currentRow}`,
            value: revenue.totalAmountBank,
            type: 'data',
            style: cellStyle,
          },
          {
            cellPosition: `K${currentRow}`,
            value: revenue.totalAmountInternal,
            type: 'data',
            style: cellStyle,
          },
        );

        totalOriginalAmount += revenue.originalAmount;
        totalPromotionAmount += revenue.promotionAmount;
        totalVoucherAmount += revenue.voucherAmount;
        totalAmount += revenue.totalAmount;
        totalOrder += revenue.totalOrder;
        totalAmountBank += revenue.totalAmountBank;
        totalAmountCash += revenue.totalAmountCash;
        totalAmountInternal += revenue.totalAmountInternal;
        currentRow++;
      });

      const totalRowStyle: Partial<ExcelJS.Style> = {
        font: { bold: true },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'e6e665' },
        },
        ...cellStyle,
      };
      cellData.push(
        {
          cellPosition: `A${currentRow}`,
          value: 'Tổng',
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `B${currentRow}`,
          value: '',
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `C${currentRow}`,
          value: totalOrder,
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `D${currentRow}`,
          value: totalOriginalAmount,
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `E${currentRow}`,
          value: totalPromotionAmount,
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `F${currentRow}`,
          value: totalVoucherAmount,
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `G${currentRow}`,
          value: '',
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `H${currentRow}`,
          value: totalAmount,
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `I${currentRow}`,
          value: totalAmountCash,
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `J${currentRow}`,
          value: totalAmountBank,
          type: 'data',
          style: totalRowStyle,
        },
        {
          cellPosition: `K${currentRow}`,
          value: totalAmountInternal,
          type: 'data',
          style: totalRowStyle,
        },
      );

      return this.fileService.generateExcelFile({
        filename: 'export-revenue.xlsx',
        cellData,
      });
    } catch (error) {
      this.logger.error(
        `Error when exporting branch revenue to Excel: ${error.message}`,
        error.stack,
        context,
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.EXPORT_BRANCH_REVENUE_ERROR,
        error.message,
      );
    }
  }

  async exportHandOverTicket(requestData: ExportHandOverTicketRequestDto) {
    const context = `${BranchRevenueService.name}.${this.exportHandOverTicket.name}`;
    this.logger.log('Start exporting hand over ticket', context);
    const { branch, startDate, endDate } = requestData;

    const branchData = await this.branchUtils.getBranch({
      where: { slug: branch },
    });

    const startDateQuery = moment(requestData.startDate).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    const endDateQuery = moment(requestData.endDate).format(
      'YYYY-MM-DD HH:mm:ss',
    );

    const { minReferenceNumberOrder, maxReferenceNumberOrder } =
      await this.orderUtils.getMinAndMaxReferenceNumberForBranch(
        branchData.id,
        startDate,
        endDate,
      );

    this.logger.log('startDateQuery', startDateQuery);
    this.logger.log('endDateQuery', endDateQuery);
    const results: BranchRevenueQueryResponseForHourDto[] =
      await this.branchRevenueRepository.query(
        getSpecificRangeBranchRevenueByHourClause,
        [startDateQuery, endDateQuery, branchData.id],
      );
    // console.log('results', results);
    const branchRevenues = this.mapper.mapArray(
      results,
      BranchRevenueQueryResponseForHourDto,
      BranchRevenue,
    );
    // console.log('branchRevenues', branchRevenues);
    let totalOriginalAmount = 0;
    let totalPromotionAmount = 0;
    let totalVoucherAmount = 0;
    let totalAmount = 0;
    let totalOrder = 0;
    let totalOrderCash = 0;
    let totalOrderBank = 0;
    let totalOrderInternal = 0;
    let totalAmountBank = 0;
    let totalAmountCash = 0;
    let totalAmountInternal = 0;

    branchRevenues.forEach((revenue) => {
      totalOriginalAmount += revenue.originalAmount;
      totalPromotionAmount += revenue.promotionAmount;
      totalVoucherAmount += revenue.voucherAmount;
      totalAmount += revenue.totalAmount;
      totalOrder += revenue.totalOrder;
      totalOrderCash += revenue.totalOrderCash;
      totalOrderBank += revenue.totalOrderBank;
      totalOrderInternal += revenue.totalOrderInternal;
      totalAmountBank += revenue.totalAmountBank;
      totalAmountCash += revenue.totalAmountCash;
      totalAmountInternal += revenue.totalAmountInternal;
    });

    if (maxReferenceNumberOrder - minReferenceNumberOrder + 1 !== totalOrder) {
      this.logger.error(
        `Number of orders not match: ${maxReferenceNumberOrder} - ${minReferenceNumberOrder} + 1 !== ${totalOrder} (maxReferenceNumberOrder - minReferenceNumberOrder + 1 !== totalOrder)`,
        null,
        context,
      );
      throw new BranchRevenueException(
        BranchRevenueValidation.NUMBER_OF_ORDERS_NOT_MATCH,
      );
    }
    // console.log('totalOrderBank', totalOrderBank);

    const logoPath = resolve('public/images/logo.png');
    const logoBuffer = readFileSync(logoPath);

    // Convert the buffer to a Base64 string
    const logoString = logoBuffer.toString('base64');

    const qrcodeBranch = await this.qrCodeService.generateQRCode(branch);

    // Prepare template data
    const templateData = {
      branchName: branchData.name,
      branchAddress: branchData.address,
      shiftStartTime: startDate,
      shiftEndTime: endDate,
      totalOrder,
      minReferenceNumberOrder,
      maxReferenceNumberOrder,
      originalAmount: totalOriginalAmount,
      totalRevenueCash: totalAmountCash,
      totalOrderCash: totalOrderCash,
      totalRevenueBank: totalAmountBank,
      totalOrderBank: totalOrderBank,
      totalPromotion: totalPromotionAmount,
      totalVoucher: totalVoucherAmount,
      totalCoin: 0,
      totalRevenue: totalAmount,
      totalOrderInternal,
      totalAmountInternal,
      createdAt: new Date(),
      qrcodeBranch,
      branchSlug: branch,
    };

    const data = await this.pdfService.generatePdf(
      'hand-over-ticket',
      { ...templateData, logoString },
      {
        width: '80mm',
      },
    );

    return data;
  }
}
