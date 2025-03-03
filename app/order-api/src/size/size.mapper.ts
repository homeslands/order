import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';

import {
  CreateSizeRequestDto,
  SizeResponseDto,
  UpdateSizeRequestDto,
} from './size.dto';
import { Size } from './size.entity';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class SizeProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, Size, SizeResponseDto, extend(baseMapper(mapper)));

      createMap(
        mapper,
        CreateSizeRequestDto,
        Size,
        forMember(
          (destination) => destination.name,
          mapFrom((source) => source.name?.toLocaleLowerCase()),
        ),
      );

      createMap(
        mapper,
        UpdateSizeRequestDto,
        Size,
        forMember(
          (destination) => destination.name,
          mapFrom((source) => source.name?.toLocaleLowerCase()),
        ),
      );
    };
  }
}
