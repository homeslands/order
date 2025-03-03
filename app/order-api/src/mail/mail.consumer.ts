import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';

@Processor(QueueRegisterKey.MAIL)
@Injectable()
export class MailConsumer extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async process(job: Job<ISendMailOptions>, token?: string): Promise<any> {
    switch (job.name) {
      case 'send-mail':
        const result = await this.mailerService.sendMail(job.data);
        return result;
    }
  }
}
