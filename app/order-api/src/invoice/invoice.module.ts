import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { Order } from 'src/order/order.entity';
import { InvoiceProfile } from './invoice.mapper';
import { PdfModule } from 'src/pdf/pdf.module';
import { QrCodeModule } from 'src/qr-code/qr-code.module';
import { InvoiceScheduler } from './invoice.scheduler';
import { DbModule } from 'src/db/db.module';
import { InvoiceListener } from './invoice.listener';
import { PrinterModule } from 'src/printer/printer.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Order]),
    PdfModule,
    QrCodeModule,
    DbModule,
    PrinterModule,
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    InvoiceProfile,
    InvoiceScheduler,
    InvoiceListener,
  ],
  exports: [InvoiceService],
})
export class InvoiceModule {}
