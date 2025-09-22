import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { Address } from './entities/address.entity';
import { AddressResponseDto } from './dto/google-map.response.dto';

@Injectable()
export class GoogleMapProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Address,
        AddressResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
