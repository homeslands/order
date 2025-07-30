import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { FeatureFlag } from './entities/feature-flag.entity';
import { FeatureFlagResponseDto } from './dto/feature-flag-response.dto';
import { FeatureGroup } from './entities/feature-group.entity';
import { FeatureGroupResponseDto } from './dto/feature-group-response.dto';

@Injectable()
export class FeatureFlagProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        FeatureFlag,
        FeatureFlagResponseDto,
        extend(baseMapper(mapper)),
      );
      createMap(mapper, FeatureGroup, FeatureGroupResponseDto);
    };
  }
}
