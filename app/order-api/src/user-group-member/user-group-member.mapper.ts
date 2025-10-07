import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  AddUserToGroupDto,
  UserGroupMemberResponseDto,
} from './user-group-member.dto';
import { UserGroupMember } from './user-group-member.entity';
import { baseMapper } from 'src/app/base.mapper';
import { GeneralUserResponseDto, UserResponseDto } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';
import { UserGroup } from 'src/user-group/user-group.entity';
import { UserGroupResponseDto } from 'src/user-group/user-group.dto';

@Injectable()
export class UserGroupMemberProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        UserGroupMember,
        UserGroupMemberResponseDto,
        forMember(
          (destination) => destination.user,
          mapWith(UserResponseDto, User, (source) => source.user),
        ),
        forMember(
          (destination) => destination.userGroup,
          mapWith(
            UserGroupResponseDto,
            UserGroup,
            (source) => source.userGroup,
          ),
        ),
        forMember(
          (destination) => destination.createdBy,
          mapWith(GeneralUserResponseDto, User, (source) => source.createdBy),
        ),
        extend(baseMapper(mapper)),
      );
      createMap(mapper, AddUserToGroupDto, UserGroupMember);
    };
  }
}
