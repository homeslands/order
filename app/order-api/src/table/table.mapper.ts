import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { Table } from './table.entity';
import {
  CreateTableRequestDto,
  TableResponseDto,
  UpdateTableRequestDto,
} from './table.dto';

@Injectable()
export class TableProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, Table, TableResponseDto, extend(baseMapper(mapper)));

      createMap(
        mapper,
        CreateTableRequestDto,
        Table,
        forMember(
          (destination) => destination.name,
          mapFrom((source) => source.name?.toLocaleUpperCase()),
        ),
      );

      createMap(
        mapper,
        UpdateTableRequestDto,
        Table,
        forMember(
          (destination) => destination.name,
          mapFrom((source) => source.name?.toLocaleUpperCase()),
        ),
      );
    };
  }
}
