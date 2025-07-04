import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterManager } from './printer.manager';
import { BullModule } from '@nestjs/bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { PrinterProfile } from './printer.mapper';
import { PrinterUtils } from './printer.utils';
import { PrinterConsumer } from './printer.consumer';
import { PrinterProducer } from './printer.producer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueRegisterKey.PRINTER,
    }),
  ],
  providers: [
    PrinterService,
    PrinterManager,
    PrinterProfile,
    PrinterUtils,
    PrinterConsumer,
    PrinterProducer,
  ],
  exports: [PrinterService, PrinterUtils],
})
export class PrinterModule {}
