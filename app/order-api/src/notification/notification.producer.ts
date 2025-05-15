import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { CREATE_NOTIFICATION_JOB } from './notification.contanst';
import { CreateNotificationDto } from './notification.dto';

@Injectable()
export class NotificationProducer {
  constructor(
    @InjectQueue(QueueRegisterKey.NOTIFICATION)
    private notificationQueue: Queue,
  ) {}

  async createNotification(data: CreateNotificationDto) {
    this.notificationQueue.add(CREATE_NOTIFICATION_JOB, data);
  }

  async bulkCreateNotification(data: CreateNotificationDto[]) {
    this.notificationQueue.addBulk(
      data.map((item) => ({
        name: CREATE_NOTIFICATION_JOB,
        data: item,
      })),
    );
  }
}
