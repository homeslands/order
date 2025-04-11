import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InvoiceItem } from 'src/invoice-item/invoice-item.entity';

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

  @Timeout(10000)
  async addPromotionAndVoucherForInvoice() {
    const context = `${InvoiceScheduler.name}.${this.addPromotionAndVoucherForInvoice.name}`;
    this.logger.log('Adding promotion and voucher for invoices', context);

    try {
      const invoices = await this.invoiceRepository.find({
        relations: [
          'order.voucher',
          'order.orderItems',
          'invoiceItems',
          'order.orderItems.promotion',
          'order.orderItems.variant',
          'order.orderItems.variant.size',
          'order.orderItems.variant.product',
        ],
      });

      for (const invoice of invoices) {
        if (invoice.order) {
          const invoiceItems = invoice.order.orderItems.map((item) => {
            const invoiceItem = new InvoiceItem();
            Object.assign(invoiceItem, {
              productName: item.variant.product.name,
              quantity: item.quantity,
              price: item.variant.price,
              total: item.subtotal,
              size: item.variant.size.name,
              promotionValue: item.promotion?.value ?? 0,
              promotionId: item.promotion?.id ?? null,
            });
            return invoiceItem;
          });
          Object.assign(invoice, {
            invoiceItems,
            voucherValue: invoice.order.voucher?.value ?? 0,
            voucherId: invoice.order.voucher?.id ?? null,
          });
        }
      }

      await this.invoiceRepository.manager.transaction(async (manager) => {
        await manager.save(invoices);
      });

      this.logger.log(
        `Promotion and voucher added for invoices: ${invoices.length}`,
        context,
      );
    } catch (error) {
      this.logger.error(
        'Error adding promotion and voucher for invoices',
        error.stack,
        context,
      );
    }
  }
}
