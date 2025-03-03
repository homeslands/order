import { createMap, extend, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Banner } from './banner.entity';
import {
  BannerResponseDto,
  CreateBannerRequestDto,
  UpdateBannerRequestDto,
} from './banner.dto';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class BannerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Map entity to response
      createMap(mapper, Banner, BannerResponseDto, extend(baseMapper(mapper)));

      // Map request object to entity
      createMap(mapper, CreateBannerRequestDto, Banner);

      createMap(mapper, UpdateBannerRequestDto, Banner);
    };
  }
}
