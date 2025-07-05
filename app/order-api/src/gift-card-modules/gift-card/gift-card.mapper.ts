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
import { GiftCard } from './entities/gift-card.entity';
import { GiftCardResponseDto } from './dto/gift-card-response.dto';

@Injectable()
export class GiftCardProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        GiftCard,
        GiftCardResponseDto,
        forMember(
          (d) => d.expiredAt,
          mapFrom((s) => s.expiredAt.toString()),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
