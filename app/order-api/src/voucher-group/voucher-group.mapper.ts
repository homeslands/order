import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import {
  CreateVoucherGroupRequestDto,
  VoucherGroupResponseDto,
} from './voucher-group.dto';
import { VoucherGroup } from './voucher-group.entity';
import { baseMapper } from 'src/app/base.mapper';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';

@Injectable()
export class VoucherGroupProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateVoucherGroupRequestDto, VoucherGroup);
      createMap(
        mapper,
        VoucherGroup,
        VoucherGroupResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
