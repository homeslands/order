import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { CreatePrintJobRequestDto } from './printer.dto';
@Injectable()
export class PrinterProducer {
  constructor(
    @InjectQueue(QueueRegisterKey.PRINTER)
    private readonly printerQueue: Queue,
  ) {}

  async createPrintJob(data: CreatePrintJobRequestDto) {
    this.printerQueue.add(`print:${data.printerIp}`, data);
  }
}
