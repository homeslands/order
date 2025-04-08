import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { baseMapper } from 'src/app/base.mapper';
import moment from 'moment';
import {
  AggregateBranchRevenueResponseDto,
  BranchRevenueQueryResponseDto,
  BranchRevenueQueryResponseForHourDto,
  BranchRevenueResponseDto,
} from './branch-revenue.dto';
import { BranchRevenue } from './branch-revenue.entity';

@Injectable()
export class BranchRevenueProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // For day => get and save data
      createMap(
        mapper,
        BranchRevenueQueryResponseDto,
        BranchRevenue,
        forMember(
          (destination) => destination.totalAmount,
          mapFrom((source) => +source.totalAmount),
        ),
        forMember(
          (destination) => destination.totalAmountBank,
          mapFrom((source) => +source.totalAmountBank),
        ),
        forMember(
          (destination) => destination.totalAmountCash,
          mapFrom((source) => +source.totalAmountCash),
        ),
        forMember(
          (destination) => destination.totalAmountInternal,
          mapFrom((source) => +source.totalAmountInternal),
        ),
        forMember(
          (destination) => destination.originalAmount,
          mapFrom((source) => +source.totalOriginalAmountOrder),
        ),
        forMember(
          (destination) => destination.promotionAmount,
          mapFrom(
            (source) =>
              +source.totalOriginalOrderItemAmount -
              +source.totalFinalOrderItemAmount,
          ),
        ),
        forMember(
          (destination) => destination.voucherAmount,
          mapFrom(
            (source) =>
              +source.totalOriginalAmountOrder -
              +source.totalAmount -
              (+source.totalOriginalOrderItemAmount -
                +source.totalFinalOrderItemAmount),
          ),
        ),
        forMember(
          (destination) => destination.totalOrder,
          mapFrom((source) => +source.totalOrder),
        ),
        forMember(
          (destination) => destination.date,
          mapFrom((source) => {
            // Date format: YYYY-MM-DDT00:00:00Z
            // Example: source.date = 2024-12-25T17:00:00.000Z
            // destination.date: 2024-12-26T00:00:00.000Z
            return moment(source.date).add(7, 'hours').toDate();
          }),
        ),
      );

      // For hour => Get and return for client
      createMap(
        mapper,
        BranchRevenueQueryResponseForHourDto,
        BranchRevenue,
        forMember(
          (destination) => destination.totalAmount,
          mapFrom((source) => +source.totalAmount),
        ),
        forMember(
          (destination) => destination.totalAmountBank,
          mapFrom((source) => +source.totalAmountBank),
        ),
        forMember(
          (destination) => destination.totalAmountCash,
          mapFrom((source) => +source.totalAmountCash),
        ),
        forMember(
          (destination) => destination.totalAmountInternal,
          mapFrom((source) => +source.totalAmountInternal),
        ),
        forMember(
          (destination) => destination.originalAmount,
          mapFrom((source) => +source.totalOriginalAmountOrder),
        ),
        forMember(
          (destination) => destination.promotionAmount,
          mapFrom(
            (source) =>
              +source.totalOriginalOrderItemAmount -
              +source.totalFinalOrderItemAmount,
          ),
        ),
        forMember(
          (destination) => destination.voucherAmount,
          mapFrom(
            (source) =>
              +source.totalOriginalAmountOrder -
              +source.totalAmount -
              (+source.totalOriginalOrderItemAmount -
                +source.totalFinalOrderItemAmount),
          ),
        ),
        forMember(
          (destination) => destination.totalOrder,
          mapFrom((source) => +source.totalOrder),
        ),
        forMember(
          (destination) => destination.date,
          mapFrom((source) => {
            return moment(source.date).toDate();
          }),
        ),
      );

      createMap(
        mapper,
        BranchRevenue,
        BranchRevenueResponseDto,
        extend(baseMapper(mapper)),
      );

      createMap(mapper, BranchRevenue, AggregateBranchRevenueResponseDto);

      createMap(
        mapper,
        AggregateBranchRevenueResponseDto,
        AggregateBranchRevenueResponseDto,
      );
    };
  }
}
