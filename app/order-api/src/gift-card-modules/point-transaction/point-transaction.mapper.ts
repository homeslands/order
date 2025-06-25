import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { PointTransaction } from './entities/point-transaction.entity';
import { PointTransactionResponseDto } from './dto/point-transaction-response.dto';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';

@Injectable()
export class PointTransactionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreatePointTransactionDto, PointTransaction);
      createMap(
        mapper,
        PointTransaction,
        PointTransactionResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
