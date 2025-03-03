import { createMap, extend, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  CreateStaticPageDto,
  StaticPageResponseDto,
  UpdateStaticPageDto,
} from './static-page.dto';
import { StaticPage } from './static-page.entity';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class StaticPageProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateStaticPageDto, StaticPage);

      createMap(mapper, UpdateStaticPageDto, StaticPage);

      createMap(
        mapper,
        StaticPage,
        StaticPageResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
