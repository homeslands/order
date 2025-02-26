import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { Tracking } from './tracking.entity';
import { TrackingResponseDto } from './tracking.dto';
import { TrackingOrderItemResponseDto } from 'src/tracking-order-item/tracking-order-item.dto';
import { TrackingOrderItem } from 'src/tracking-order-item/tracking-order-item.entity';

@Injectable()
export class TrackingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Tracking,
        TrackingResponseDto,
        forMember(
          (destination) => destination.trackingOrderItems,
          mapWith(
            TrackingOrderItemResponseDto,
            TrackingOrderItem,
            (source) => source.trackingOrderItems,
          ),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
