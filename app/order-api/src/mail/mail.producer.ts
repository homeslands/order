import { ISendMailOptions } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';

@Injectable()
export class MailProducer {
  constructor(
    @InjectQueue(QueueRegisterKey.MAIL)
    private mailQueue: Queue,
  ) {}

  async sendMail(data: ISendMailOptions) {
    this.mailQueue.add('send-mail', data);
  }
}
