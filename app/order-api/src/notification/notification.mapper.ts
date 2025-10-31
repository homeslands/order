import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  mapFrom,
  Mapper,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { baseMapper } from 'src/app/base.mapper';
import { Notification } from './notification.entity';
import {
  CreateNotificationDto,
  FirebaseRegisterDeviceTokenResponseDto,
  NotificationResponseDto,
} from './notification.dto';
import { FirebaseDeviceToken } from './firebase/firebase-device-token.entity';

@Injectable()
export class NotificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Notification,
        NotificationResponseDto,
        extend(baseMapper(mapper)),
        forMember(
          (d) => d.metadata,
          mapFrom((s) => s.metadata),
        ),
      );
      createMap(
        mapper,
        CreateNotificationDto,
        Notification,
        forMember(
          (d) => d.metadata,
          mapFrom((s) => JSON.stringify(s.metadata)),
        ),
      );
      createMap(
        mapper,
        FirebaseDeviceToken,
        FirebaseRegisterDeviceTokenResponseDto,
        extend(baseMapper(mapper)),
      );
    };
  }
}
