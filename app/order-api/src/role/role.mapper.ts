import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Role } from './role.entity';
import { CreateRoleDto, RoleResponseDto } from './role.dto';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class RoleProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateRoleDto, Role);
      createMap(mapper, Role, RoleResponseDto, extend(baseMapper(mapper)));
    };
  }
}
