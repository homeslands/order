import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { AuthorityGroup } from './authority-group.entity';
import { baseMapper } from 'src/app/base.mapper';
import { AuthorityGroupResponseDto } from './authority-group.dto';

@Injectable()
export class AuthorityGroupProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        AuthorityGroup,
        AuthorityGroupResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
