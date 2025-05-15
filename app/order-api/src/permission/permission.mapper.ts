import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { baseMapper } from 'src/app/base.mapper';
import { CreatePermissionDto, PermissionResponseDto } from './permission.dto';
import { Permission } from './permission.entity';

@Injectable()
export class PermissionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreatePermissionDto, Permission);
      createMap(
        mapper,
        Permission,
        PermissionResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
