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
      createMap(
        mapper,
        BranchRevenueQueryResponseDto,
        BranchRevenue,
        forMember(
          (destination) => destination.totalAmount,
          mapFrom((source) => +source.totalAmount),
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

      createMap(
        mapper,
        BranchRevenue,
        BranchRevenueResponseDto,
        extend(baseMapper(mapper)),
      );

      createMap(
        mapper,
        BranchRevenue,
        AggregateBranchRevenueResponseDto,
      );

      createMap(
        mapper,
        AggregateBranchRevenueResponseDto,
        AggregateBranchRevenueResponseDto,
      );
    };
  }
}
