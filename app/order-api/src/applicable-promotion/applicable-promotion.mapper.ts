import { createMap, extend, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicablePromotion } from './applicable-promotion.entity';
import {
  ApplicablePromotionResponseDto,
  CreateApplicablePromotionRequestDto,
  CreateManyApplicablePromotionsRequestDto,
} from './applicable-promotion.dto';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class ApplicablePromotionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        CreateApplicablePromotionRequestDto,
        ApplicablePromotion,
      );
      createMap(
        mapper,
        CreateManyApplicablePromotionsRequestDto,
        ApplicablePromotion,
      );
      createMap(
        mapper,
        ApplicablePromotion,
        ApplicablePromotionResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
