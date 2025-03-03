import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import {
  AggregateRevenueResponseDto,
  RevenueQueryResponseDto,
  RevenueResponseDto,
} from './revenue.dto';
import { Revenue } from './revenue.entity';
import { baseMapper } from 'src/app/base.mapper';
import moment from 'moment';

@Injectable()
export class RevenueProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        RevenueQueryResponseDto,
        Revenue,
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
        Revenue,
        RevenueResponseDto,
        extend(baseMapper(mapper)),
      );

      createMap(mapper, Revenue, AggregateRevenueResponseDto);

      createMap(
        mapper,
        AggregateRevenueResponseDto,
        AggregateRevenueResponseDto,
      );
    };
  }
}
