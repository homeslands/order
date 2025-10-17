import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { VoucherUserGroup } from './voucher-user-group.entity';
import { VoucherUserGroupResponseDto } from './voucher-user-group.dto';
import { VoucherResponseDto } from 'src/voucher/voucher.dto';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { UserGroupResponseDto } from 'src/user-group/user-group.dto';
import { UserGroup } from 'src/user-group/user-group.entity';
import { baseMapper } from 'src/app/base.mapper';

@Injectable()
export class VoucherUserGroupProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        VoucherUserGroup,
        VoucherUserGroupResponseDto,
        forMember(
          (destination) => destination.voucher,
          mapWith(VoucherResponseDto, Voucher, (source) => source.voucher),
        ),
        forMember(
          (destination) => destination.userGroup,
          mapWith(
            UserGroupResponseDto,
            UserGroup,
            (source) => source.userGroup,
          ),
        ),
        extend(baseMapper(mapper)),
      );
    };
  }
}
