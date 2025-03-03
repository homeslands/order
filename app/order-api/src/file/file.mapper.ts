import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { File } from './file.entity';
import { FileResponseDto } from './file.dto';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class FileProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        File,
        FileResponseDto,
        forMember(
          (d) => d.data,
          // mapWith(Buffer, String, (s) => Buffer.from(s.data, 'base64')),
          mapFrom((s) => Buffer.from(s.data, 'base64')),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
