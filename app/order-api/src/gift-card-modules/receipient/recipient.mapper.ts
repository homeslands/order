import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, extend, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { RecipientResponseDto } from './dto/recipient-response.dto';
import { CreateRecipientDto } from './dto/create-recipient.dto';
import { Recipient } from './entities/receipient.entity';

@Injectable()
export class RecipientProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateRecipientDto, Recipient);
      createMap(
        mapper,
        Recipient,
        RecipientResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
