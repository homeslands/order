import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { CoinPolicy } from './entities/coin-policy.entity';
import { CoinPolicyResponseDto } from './dto/coin-policy-response.dto';

@Injectable()
export class CoinPolicyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CoinPolicy, CoinPolicyResponseDto, extend(baseMapper(mapper)));
    };
  }
}
