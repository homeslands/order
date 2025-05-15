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
import { Branch } from './branch.entity';
import { BranchResponseDto, CreateBranchDto } from './branch.dto';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ChefArea } from 'src/chef-area/chef-area.entity';

@Injectable()
export class BranchProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Branch,
        BranchResponseDto,
        forMember(
          (destination) => destination.chefAreas,
          mapWith(ChefAreaResponseDto, ChefArea, (source) => source.chefAreas),
        ),
        extend(baseMapper(mapper)),
      );
      createMap(mapper, CreateBranchDto, Branch);
    };
  }
}
