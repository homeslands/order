import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { baseMapper } from 'src/app/base.mapper';
import { ChefOrder } from './chef-order.entity';
import { ChefOrderResponseDto } from './chef-order.dto';
import { OrderResponseDto } from 'src/order/order.dto';
import { Order } from 'src/order/order.entity';
import { ChefOrderItemResponseDto } from 'src/chef-order-item/chef-order-item.dto';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ChefArea } from 'src/chef-area/chef-area.entity';

@Injectable()
export class ChefOrderProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Map entity to response
      createMap(
        mapper,
        ChefOrder,
        ChefOrderResponseDto,
        forMember(
          (d) => d.order,
          mapWith(OrderResponseDto, Order, (o) => o.order),
        ),
        forMember(
          (d) => d.chefArea,
          mapWith(ChefAreaResponseDto, ChefArea, (c) => c.chefArea),
        ),
        forMember(
          (d) => d.chefOrderItems,
          mapWith(
            ChefOrderItemResponseDto,
            ChefOrderItem,
            (c) => c.chefOrderItems,
          ),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
