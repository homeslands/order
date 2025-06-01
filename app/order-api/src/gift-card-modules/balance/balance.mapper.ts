import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { Balance } from './entities/balance.entity';
import { BalanceResponseDto } from './dto/balance-response.dto';

@Injectable()
export class BalanceProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Balance,
        BalanceResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
