import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterManager } from './printer.manager';
import { BullModule } from '@nestjs/bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { PrinterProfile } from './printer.mapper';
import { PrinterUtils } from './printer.utils';
import { PrinterConsumer } from './printer.consumer';
import { PrinterProducer } from './printer.producer';
import { PrinterJob } from './entity/printer-job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterWorker } from './printer.worker';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { DbModule } from 'src/db/db.module';
import { Order } from 'src/order/order.entity';
import { InvoiceService } from 'src/invoice/invoice.service';
import { Invoice } from 'src/invoice/invoice.entity';
import { QrCodeService } from 'src/qr-code/qr-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrinterJob, ChefOrder, Order, Invoice]),
    BullModule.registerQueue({
      name: QueueRegisterKey.PRINTER,
    }),
    DbModule,
  ],
  providers: [
    PrinterService,
    PrinterManager,
    PrinterProfile,
    PrinterUtils,
    PrinterConsumer,
    PrinterProducer,
    PrinterWorker,
    PdfService,
    InvoiceService,
    QrCodeService,
  ],
  exports: [PrinterService, PrinterUtils],
})
export class PrinterModule {}
