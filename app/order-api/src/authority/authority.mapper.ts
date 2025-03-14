import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { baseMapper } from 'src/app/base.mapper';
import { Authority } from './authority.entity';
import { AuthorityResponseDto } from './authority.dto';

@Injectable()
export class AuthorityProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Authority,
        AuthorityResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
