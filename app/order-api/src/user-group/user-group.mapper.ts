import { createMap, extend, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserGroup } from './user-group.entity';
import {
  CreateUserGroupDto,
  UpdateUserGroupDto,
  UserGroupResponseDto,
} from './user-group.dto';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class UserGroupProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        UserGroup,
        UserGroupResponseDto,
        extend(baseMapper(mapper)),
      );
      createMap(mapper, CreateUserGroupDto, UserGroup);
      createMap(mapper, UpdateUserGroupDto, UserGroup);
    };
  }
}
