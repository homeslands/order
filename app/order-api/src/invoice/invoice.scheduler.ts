import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class InvoiceScheduler {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly qrCodeService: QrCodeService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateQrCode() {
    const context = `${InvoiceScheduler.name}.${this.updateQrCode.name}`;
    this.logger.log('Updating QR code for invoices', context);

    const invoices = await this.invoiceRepository.find({
      where: {
        qrcode: '',
      },
    });

    this.logger.log(
      `Found ${invoices.length} invoices without QR code`,
      context,
    );

    const updatedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        invoice.qrcode = await this.qrCodeService.generateQRCode(invoice.slug);
        return invoice;
      }),
    );

    await this.invoiceRepository.manager.transaction(async (manager) => {
      await manager.save(updatedInvoices);
    });

    this.logger.log('QR code updated for invoices', context);
  }
}
