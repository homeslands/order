import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { InvoiceArea } from './invoice-area.entity';
import {
  CreateInvoiceAreaRequestDto,
  InvoiceAreaResponseDto,
  UpdateInvoiceAreaRequestDto,
} from './invoice-area.dto';

@Injectable()
export class InvoiceAreaProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        InvoiceArea,
        InvoiceAreaResponseDto,
        extend(baseMapper(mapper)),
      );
      createMap(mapper, CreateInvoiceAreaRequestDto, InvoiceArea);
      createMap(mapper, UpdateInvoiceAreaRequestDto, InvoiceArea);
    };
  }
}
