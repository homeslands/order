import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { AccumulatedPoint } from './entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from './entities/accumulated-point-transaction-history.entity';
import {
  AccumulatedPointResponseDto,
  PointTransactionHistoryResponseDto,
} from './accumulated-point.dto';

@Injectable()
export class AccumulatedPointProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, AccumulatedPoint, AccumulatedPointResponseDto);
      createMap(
        mapper,
        AccumulatedPointTransactionHistory,
        PointTransactionHistoryResponseDto,
      );
    };
  }
}
