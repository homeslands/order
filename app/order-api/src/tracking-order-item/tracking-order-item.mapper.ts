import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
  mapWith,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import {
  CreateTrackingOrderItemWithQuantityAndOrderItemEntity,
  TrackingOrderItemResponseDto,
} from './tracking-order-item.dto';
import { TrackingResponseDto } from 'src/tracking/tracking.dto';
import { Tracking } from 'src/tracking/tracking.entity';
import { TrackingOrderItem } from './tracking-order-item.entity';
import { OrderItemResponseDto } from 'src/order-item/order-item.dto';
import { OrderItem } from 'src/order-item/order-item.entity';

@Injectable()
export class TrackingOrderItemProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        TrackingOrderItem,
        TrackingOrderItemResponseDto,
        forMember(
          (destination) => destination.tracking,
          mapWith(TrackingResponseDto, Tracking, (source) => source.tracking),
        ),
        forMember(
          (destination) => destination.orderItem,
          mapWith(
            OrderItemResponseDto,
            OrderItem,
            (source) => source.orderItem,
          ),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
