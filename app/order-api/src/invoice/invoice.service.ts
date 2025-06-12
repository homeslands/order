import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ExportInvoiceDto,
  GetSpecificInvoiceRequestDto,
  InvoiceResponseDto,
} from './invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/order/order.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderException } from 'src/order/order.exception';
import { OrderValidation } from 'src/order/order.validation';
import { InvoiceItem } from 'src/invoice-item/invoice-item.entity';
import * as _ from 'lodash';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { InvoiceException } from './invoice.exception';
import { InvoiceValidation } from './invoice.validation';
import { DiscountType, OrderType } from 'src/order/order.constants';
import { VoucherType } from 'src/voucher/voucher.constant';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly pdfService: PdfService,
    private readonly qrCodeService: QrCodeService,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  async updateDiscountTypeForExistedInvoice() {
    const context = `${InvoiceService.name}.${this.updateDiscountTypeForExistedInvoice.name}`;
    const batchSize = 500;
    let offset = 0;
    let totalUpdated = 0;

    while (true) {
      const batch = await this.invoiceRepository.find({
        where: { voucherType: null },
        relations: ['order.voucher'],
        take: batchSize,
        skip: offset,
        order: { id: 'ASC' },
      });

      if (batch.length === 0) break;

      const updatedBatch: Invoice[] = [];
      for (const item of batch) {
        if (item?.order?.voucher) {
          item.voucherType = item.order.voucher.type;
          item.valueEachVoucher = item.order.voucher.value;
          updatedBatch.push(item);
        }
      }

      await this.transactionManagerService.execute<void>(
        async (manager) => {
          await manager.save(updatedBatch);
        },
        () => {
          this.logger.log(
            `Processed batch from offset ${offset}, updated ${updatedBatch.length} items.`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error updating batch at offset ${offset}: ${error.message}`,
            context,
          );
        },
      );

      totalUpdated += updatedBatch.length;
      offset += batchSize;
    }
    this.logger.log(
      `Finished updating total ${totalUpdated} invoice items.`,
      context,
    );
  }

  async exportInvoice(requestData: ExportInvoiceDto): Promise<Buffer> {
    const context = `${InvoiceService.name}.${this.exportInvoice.name}`;
    const invoice = await this.create(requestData.order);

    const logoPath = resolve('public/images/logo.png');
    const logoBuffer = readFileSync(logoPath);

    // Convert the buffer to a Base64 string
    const logoString = logoBuffer.toString('base64');

    const data = await this.pdfService.generatePdf(
      'invoice',
      { ...invoice, logoString },
      {
        width: '80mm',
      },
    );

    this.logger.log(`Invoice ${invoice.slug} exported`, context);

    return data;
  }

  private async create(orderSlug: string) {
    const context = `${InvoiceService.name}.${this.create.name}`;
    const order = await this.orderRepository.findOne({
      where: { slug: orderSlug },
      relations: [
        'invoice.invoiceItems',
        'payment',
        'owner',
        'branch',
        'orderItems.variant.product',
        'orderItems.promotion',
        'orderItems.variant.size',
        'approvalBy',
        'table',
        'voucher',
      ],
    });
    if (!order) {
      this.logger.warn(`Order ${orderSlug} not found`, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }

    let orderItemPromotionValue = 0;

    // default from order
    orderItemPromotionValue = order.orderItems?.reduce(
      (total, current) =>
        current.discountType === DiscountType.PROMOTION
          ? total +
            (current.variant.price *
              (current.promotion?.value ?? 0) *
              current.quantity) /
              100
          : total,
      0,
    );

    // from invoice
    if (order.invoice) {
      orderItemPromotionValue = order.invoice.invoiceItems?.reduce(
        (total, current) =>
          current.discountType === DiscountType.PROMOTION
            ? total +
              (current.price * current.promotionValue * current.quantity) / 100
            : total,
        0,
      );
    }

    const orderItemVoucherValue = order.orderItems?.reduce(
      (total, current) => total + current.voucherValue,
      0,
    );

    const originalSubtotalOrder = order.orderItems?.reduce(
      (total, current) => total + current.originalSubtotal,
      0,
    );

    const subtotalOrderItem = order.orderItems?.reduce(
      (total, current) => total + current.subtotal,
      0,
    );

    let voucherValue = order.loss + orderItemVoucherValue;
    if (order?.voucher?.type === VoucherType.PERCENT_ORDER) {
      voucherValue += (subtotalOrderItem * order.voucher.value) / 100;
    }
    if (order?.voucher?.type === VoucherType.FIXED_VALUE) {
      if (subtotalOrderItem > order.voucher.value) {
        voucherValue += order.voucher.value;
      } else {
        voucherValue += subtotalOrderItem;
      }
    }

    // invoice exists
    if (order.invoice) {
      this.logger.warn(
        `Invoice for order ${orderSlug} already exists`,
        context,
      );
      Object.assign(order.invoice, {
        originalSubtotalOrder,
        subtotalOrderItem,
        orderItemPromotionValue,
        voucherCode: order.voucher?.code ?? 'N/A',
      });
      return order.invoice;
    }

    const invoiceItems = order.orderItems.map((item) => {
      const invoiceItem = new InvoiceItem();
      Object.assign(invoiceItem, {
        productName: item.variant.product.name,
        quantity: item.quantity,
        price: item.variant.price,
        total: item.subtotal,
        size: item.variant.size.name,
        promotionValue: item.promotion?.value ?? 0,
        promotionId: item.promotion?.id ?? null,
        voucherValue: item.voucherValue,
        discountType: item.discountType,
      });
      return invoiceItem;
    });

    const invoice = new Invoice();
    const qrcode = await this.qrCodeService.generateQRCode(order.slug);
    Object.assign(invoice, {
      order,
      logo: 'https://i.imgur',
      amount: order.subtotal,
      loss: order.loss,
      paymentMethod: order.payment?.paymentMethod,
      status: order.status,
      tableName:
        order.type === OrderType.AT_TABLE ? order.table.name : 'take out',
      customer: `${order.owner.firstName} ${order.owner.lastName}`,
      branchAddress: order.branch.address,
      cashier: `${order.approvalBy?.firstName} ${order.approvalBy?.lastName}`,
      invoiceItems,
      qrcode,
      referenceNumber: order.referenceNumber,
      voucherValue,
      voucherId: order.voucher?.id ?? null,
      voucherType: order.voucher?.type ?? null,
      valueEachVoucher: order.voucher?.value ?? null,
    });

    // console.log({ order });
    // console.log({ invoice });
    // console.log({ invoiceItems: invoice.invoiceItems[0] });

    await this.invoiceRepository.manager.transaction(async (manager) => {
      try {
        await manager.save(invoice);
      } catch (error) {
        throw new InvoiceException(
          InvoiceValidation.CREATE_INVOICE_ERROR,
          error.message,
        );
      }
    });

    this.logger.log(
      `Invoice ${invoice.id} created for order ${order.id}`,
      context,
    );

    Object.assign(invoice, {
      originalSubtotalOrder,
      subtotalOrderItem,
      orderItemPromotionValue,
      voucherCode: order.voucher?.code ?? 'N/A',
    });

    return invoice;
  }

  async getSpecificInvoice(query: GetSpecificInvoiceRequestDto) {
    if (_.isEmpty(query))
      throw new InvoiceException(InvoiceValidation.INVALID_QUERY);

    const invoice = await this.invoiceRepository.findOne({
      where: {
        order: { slug: query.order },
        slug: query.slug,
      },
      relations: ['invoiceItems'],
    });

    return this.mapper.map(invoice, Invoice, InvoiceResponseDto);
  }
}
