import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Voucher } from './voucher.entity';
import {
  BulkCreateVoucherDto,
  CreateVoucherDto,
  VoucherResponseDto,
} from './voucher.dto';
import { baseMapper } from 'src/app/base.mapper';
import moment from 'moment';

@Injectable()
export class VoucherProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Voucher,
        VoucherResponseDto,
        extend(baseMapper(mapper)),
        forMember(
          (destination) => destination.startDate,
          mapFrom((source) => {
            // Date format: YYYY-MM-DDT00:00:00Z
            // Example: source.date = 2024-12-25T17:00:00.000Z
            // destination.date: 2024-12-26T00:00:00.000Z
            return moment(source.startDate).add(7, 'hours').toDate();
          }),
        ),
        forMember(
          (destination) => destination.endDate,
          mapFrom((source) => {
            // Date format: YYYY-MM-DDT00:00:00Z
            // Example: source.date = 2024-12-25T17:00:00.000Z
            // destination.date: 2024-12-26T00:00:00.000Z
            return moment(source.endDate).add(7, 'hours').toDate();
          }),
        ),
      );
      createMap(mapper, CreateVoucherDto, Voucher);
      createMap(mapper, BulkCreateVoucherDto, Voucher);
    };
  }
}
