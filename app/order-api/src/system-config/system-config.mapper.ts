import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { SystemConfig } from './system-config.entity';
import { SystemConfigResponseDto } from './system-config.dto';

@Injectable()
export class SystemConfigProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        SystemConfig,
        SystemConfigResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
