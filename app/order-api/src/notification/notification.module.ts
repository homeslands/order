import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueRegisterKey.NOTIFICATION,
    }),
    TypeOrmModule.forFeature([Notification, User]),
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
  ],
  exports: [
    NotificationService,
    NotificationProducer,
    NotificationUtils,
    BullModule,
  ],
})
export class NotificationModule {}
