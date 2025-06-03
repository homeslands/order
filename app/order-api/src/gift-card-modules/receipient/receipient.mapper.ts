import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { Receipient } from './entities/receipient.entity';
import { ReceipientResponseDto } from './dto/receipient-response.dto';
import { CreateReceipientDto } from './dto/create-receipient.dto';


@Injectable()
export class ReceipientProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateReceipientDto, Receipient);
      createMap(mapper, Receipient, ReceipientResponseDto, extend(baseMapper(mapper)));
    };
  }
}
