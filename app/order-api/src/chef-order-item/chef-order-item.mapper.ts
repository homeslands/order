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
import { ChefOrderItem } from './chef-order-item.entity';
import { ChefOrderItemResponseDto } from './chef-order-item.dto';
import { OrderItemResponseDto } from 'src/order-item/order-item.dto';
import { OrderItem } from 'src/order-item/order-item.entity';
import { ChefOrderResponseDto } from 'src/chef-order/chef-order.dto';
import { ChefOrder } from 'src/chef-order/chef-order.entity';

@Injectable()
export class ChefOrderItemProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Map entity to response
      createMap(
        mapper,
        ChefOrderItem,
        ChefOrderItemResponseDto,
        forMember(
          (d) => d.orderItem,
          mapWith(OrderItemResponseDto, OrderItem, (o) => o.orderItem),
        ),
        forMember(
          (d) => d.chefOrder,
          mapWith(ChefOrderResponseDto, ChefOrder, (c) => c.orderItem),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
