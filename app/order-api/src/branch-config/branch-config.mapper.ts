import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { baseMapper } from 'src/app/base.mapper';
import { BranchConfig } from './branch-config.entity';
import { BranchConfigResponseDto } from './branch-config.dto';
import { CreateBranchConfigDto } from './branch-config.dto';

@Injectable()
export class BranchConfigProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateBranchConfigDto, BranchConfig);
      createMap(
        mapper,
        BranchConfig,
        BranchConfigResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
