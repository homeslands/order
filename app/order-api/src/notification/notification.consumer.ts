import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './notification.dto';

@Processor(QueueRegisterKey.NOTIFICATION)
@Injectable()
export class NotificationConsumer extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async process(job: Job<CreateNotificationDto>, token?: string): Promise<any> {
    switch (job.name) {
      case 'create-notification':
        const result = await this.notificationService.create(job.data);
        return result;
    }
  }
}
