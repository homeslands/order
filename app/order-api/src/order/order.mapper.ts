import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';
import {
  ApprovalUserResponseDto,
  CreateOrderRequestDto,
  OrderResponseDto,
  OrderTableResponseDto,
  OwnerResponseDto,
} from './order.dto';
import { baseMapper } from 'src/app/base.mapper';
import { User } from 'src/user/user.entity';
import { OrderItemResponseDto } from 'src/order-item/order-item.dto';
import { OrderItem } from 'src/order-item/order-item.entity';
import { Table } from 'src/table/table.entity';
import { VoucherResponseDto } from 'src/voucher/voucher.dto';
import { Voucher } from 'src/voucher/voucher.entity';

@Injectable()
export class OrderProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Order,
        OrderResponseDto,
        forMember(
          (destination) => destination.owner,
          mapWith(OwnerResponseDto, User, (source) => source.owner),
        ),
        forMember(
          (destination) => destination.approvalBy,
          mapWith(ApprovalUserResponseDto, User, (source) => source.approvalBy),
        ),
        forMember(
          (destination) => destination.orderItems,
          mapWith(
            OrderItemResponseDto,
            OrderItem,
            (source) => source.orderItems,
          ),
        ),
        forMember(
          (destination) => destination.voucher,
          mapWith(VoucherResponseDto, Voucher, (source) => source.voucher),
        ),
        extend(baseMapper(mapper)),
      );

      createMap(mapper, User, OwnerResponseDto, extend(baseMapper(mapper)));

      createMap(
        mapper,
        Table,
        OrderTableResponseDto,
        extend(baseMapper(mapper)),
      );

      createMap(
        mapper,
        User,
        ApprovalUserResponseDto,
        extend(baseMapper(mapper)),
      );

      createMap(mapper, CreateOrderRequestDto, Order);
    };
  }
}
