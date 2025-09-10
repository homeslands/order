import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { CardOrderResponseDto } from './dto/card-order-response.dto';
import { CardOrder } from './entities/card-order.entity';
import { CreateCardOrderDto } from './dto/create-card-order.dto';

@Injectable()
export class CardOrderProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        CardOrder,
        CardOrderResponseDto,
        extend(baseMapper(mapper)),
        forMember(d => d.cancelAt, mapFrom(s => s.cancelAt?.toISOString() ?? null)),
      );
      createMap(mapper, CreateCardOrderDto, CardOrder);
    };
  }
}
