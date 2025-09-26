import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { FeatureFlagSystem } from './entities/feature-flag-system.entity';
import {
  FeatureFlagSystemResponseDto,
  FeatureSystemGroupResponseDto,
} from './feature-flag-system.dto';
import { FeatureSystemGroup } from './entities/feature-system-group.entity';

@Injectable()
export class FeatureFlagSystemProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        FeatureFlagSystem,
        FeatureFlagSystemResponseDto,
        extend(baseMapper(mapper)),
      );
      createMap(
        mapper,
        FeatureSystemGroup,
        FeatureSystemGroupResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
