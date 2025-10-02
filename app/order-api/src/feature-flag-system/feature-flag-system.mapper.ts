import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { FeatureFlagSystem } from './entities/feature-flag-system.entity';
import {
  ChildFeatureFlagSystemResponseDto,
  FeatureFlagSystemResponseDto,
  FeatureSystemGroupResponseDto,
} from './feature-flag-system.dto';
import { FeatureSystemGroup } from './entities/feature-system-group.entity';
import { ChildFeatureFlagSystem } from './entities/child-feature-flag-system.entity';

@Injectable()
export class FeatureFlagSystemProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        ChildFeatureFlagSystem,
        ChildFeatureFlagSystemResponseDto,
        extend(baseMapper(mapper)),
      );
      createMap(
        mapper,
        FeatureFlagSystem,
        FeatureFlagSystemResponseDto,
        forMember(
          (des) => des.children,
          mapWith(
            ChildFeatureFlagSystemResponseDto,
            ChildFeatureFlagSystem,
            (source) => source.children,
          ),
        ),
        extend(baseMapper(mapper)),
      );
      createMap(
        mapper,
        FeatureSystemGroup,
        FeatureSystemGroupResponseDto,
        forMember(
          (des) => des.features,
          mapWith(
            FeatureFlagSystemResponseDto,
            FeatureFlagSystem,
            (source) => source.features,
          ),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
