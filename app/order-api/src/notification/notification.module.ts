import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { BullModule } from '@nestjs/bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { NotificationProducer } from './notification.producer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationConsumer } from './notification.consumer';
import { DbModule } from 'src/db/db.module';
import { UserModule } from 'src/user/user.module';
import { NotificationProfile } from './notification.mapper';
import { NotificationUtils } from './notification.utils';
import { User } from 'src/user/user.entity';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseDeviceToken } from './firebase/firebase-device-token.entity';
import { NotificationLanguageService } from './language/notification-language.service';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueRegisterKey.NOTIFICATION,
    }),
    TypeOrmModule.forFeature([
      Notification,
      User,
      FirebaseDeviceToken,
      SystemConfig,
    ]),
    DbModule,
    UserModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationProducer,
    NotificationConsumer,
    NotificationProfile,
    NotificationUtils,
    FirebaseService,
    NotificationLanguageService,
    SystemConfigService,
  ],
  exports: [
    NotificationService,
    NotificationProducer,
    NotificationUtils,
    BullModule,
  ],
})
export class NotificationModule {}
