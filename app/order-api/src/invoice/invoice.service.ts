import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ExportInvoiceDto,
  ExportTemporaryInvoiceDto,
  GetSpecificInvoiceRequestDto,
  InvoiceResponseDto,
} from './invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { IsNull, Not, Repository } from 'typeorm';
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
import {
  DiscountType,
  OrderStatus,
  OrderType,
} from 'src/order/order.constants';
import {
  VoucherApplicabilityRule,
  VoucherType,
} from 'src/voucher/voucher.constant';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import moment from 'moment';
import { PaymentMethod } from 'src/payment/payment.constants';

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

  async updateVoucherValueForExistedInvoice() {
    const context = `${InvoiceService.name}.${this.updateDiscountTypeForExistedInvoice.name}`;
    const batchSize = 500;
    let offset = 0;
    let totalUpdated = 0;

    this.logger.log(
      'Start updating voucher value for existed invoice',
      context,
    );

    while (true) {
      const batch = await this.invoiceRepository.find({
        where: { voucherId: Not(IsNull()) },
        relations: ['order.voucher', 'invoiceItems'],
        take: batchSize,
        skip: offset,
        order: { id: 'ASC' },
      });

      if (batch.length === 0) break;

      const updatedBatch: Invoice[] = [];
      for (const item of batch) {
        if (item?.order?.voucher) {
          const orderItemVoucherValue = item.invoiceItems?.reduce(
            (total, current) => total + current.voucherValue,
            0,
          );

          let voucherValue = item.loss + orderItemVoucherValue;

          const subtotalOrderItem = item.invoiceItems?.reduce(
            (total, current) => total + current.total,
            0,
          );

          if (
            item.order?.voucher?.applicabilityRule ===
            VoucherApplicabilityRule.ALL_REQUIRED
          ) {
            if (item.order?.voucher?.type === VoucherType.PERCENT_ORDER) {
              voucherValue +=
                (subtotalOrderItem * item.order.voucher.value) / 100;
            }
            if (item.order?.voucher?.type === VoucherType.FIXED_VALUE) {
              if (subtotalOrderItem > item.order.voucher.value) {
                voucherValue += item.order.voucher.value;
              } else {
                voucherValue += subtotalOrderItem;
              }
            }
          }

          item.voucherValue = voucherValue;
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

    // const updatedBatch: Invoice[] = [];

    // const item = await this.invoiceRepository.findOne({
    //   where: { slug: '40c7057336' },
    //   relations: ['order.voucher', 'invoiceItems'],
    // });

    // if (item?.order?.voucher) {
    //   const orderItemVoucherValue = item.invoiceItems?.reduce(
    //     (total, current) => total + current.voucherValue,
    //     0,
    //   );

    //   let voucherValue = item.loss + orderItemVoucherValue;

    //   const subtotalOrderItem = item.invoiceItems?.reduce(
    //     (total, current) => total + current.total,
    //     0,
    //   );

    //   if (
    //     item.order?.voucher?.applicabilityRule ===
    //     VoucherApplicabilityRule.ALL_REQUIRED
    //   ) {
    //     if (item.order?.voucher?.type === VoucherType.PERCENT_ORDER) {
    //       voucherValue += (subtotalOrderItem * item.order.voucher.value) / 100;
    //     }
    //     if (item.order?.voucher?.type === VoucherType.FIXED_VALUE) {
    //       if (subtotalOrderItem > item.order.voucher.value) {
    //         voucherValue += item.order.voucher.value;
    //       } else {
    //         voucherValue += subtotalOrderItem;
    //       }
    //     }
    //   }

    //   item.voucherValue = voucherValue;
    //   updatedBatch.push(item);
    // }

    // await this.transactionManagerService.execute<void>(
    //   async (manager) => {
    //     await manager.save(updatedBatch);
    //   },
    //   () => {
    //     this.logger.log(
    //       `Processed batch from offset ${offset}, updated ${updatedBatch.length} items.`,
    //       context,
    //     );
    //   },
    //   (error) => {
    //     this.logger.error(
    //       `Error updating batch at offset ${offset}: ${error.message}`,
    //       context,
    //     );
    //   },
    // );
    this.logger.log(
      `Finished updating total ${totalUpdated} invoice items.`,
      context,
    );
  }

  async updateInvoiceStatusPaidWithOrderCompletedPayment() {
    const context = `${InvoiceService.name}.${this.updateInvoiceStatusPaidWithOrderCompletedPayment.name}`;

    const batchSize = 500;
    let offset = 0;
    let totalUpdated = 0;

    this.logger.log(
      'Start updating voucher value for existed invoice',
      context,
    );

    while (true) {
      const batch = await this.orderRepository.find({
        where: {
          referenceNumber: Not(IsNull()),
          invoice: { referenceNumber: IsNull() },
        },
        relations: ['invoice'],
        take: batchSize,
        skip: offset,
        order: { id: 'ASC' },
      });

      if (batch.length === 0) break;

      const updatedBatch: Invoice[] = [];
      for (const item of batch) {
        if (item.invoice) {
          // invoice have reference number is null
          if (!item.invoice.referenceNumber) {
            const invoice = await this.invoiceRepository.findOne({
              where: { order: { id: item.id } },
            });

            if (invoice) {
              invoice.status = OrderStatus.PAID;
              invoice.referenceNumber = item.referenceNumber;
            }
            updatedBatch.push(invoice);
          }
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

  async createInvoiceForPaidOrderWithoutInvoice() {
    const context = `${InvoiceService.name}.${this.createInvoiceForPaidOrderWithoutInvoice.name}`;

    const batchSize = 500;
    let offset = 0;
    let totalUpdated = 0;

    this.logger.log(
      'Start updating voucher value for existed invoice',
      context,
    );

    while (true) {
      const batch = await this.orderRepository.find({
        where: {
          referenceNumber: Not(IsNull()),
          invoice: IsNull(),
        },
        relations: ['invoice'],
        take: batchSize,
        skip: offset,
        order: { id: 'ASC' },
      });

      if (batch.length === 0) break;

      const updatedBatch: Invoice[] = [];

      await Promise.allSettled(
        batch.map(async (item) => {
          if (!item.invoice) {
            const invoice = await this.create(item.slug);
            updatedBatch.push(invoice);
          }
        }),
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

  async exportBufferPng(requestData: ExportInvoiceDto): Promise<Buffer> {
    const context = `${InvoiceService.name}.${this.exportInvoice.name}`;
    const invoice = await this.create(requestData.order);

    const logoPath = resolve('public/images/dark_logo.png');
    const logoBuffer = readFileSync(logoPath);

    // Convert the buffer to a Base64 string
    const logoString = logoBuffer.toString('base64');

    const data = await this.pdfService.generatePngFromTemplate('invoice', {
      ...invoice,
      logoString,
    });

    this.logger.log(`Invoice png ${invoice.slug} exported`, context);

    return data;
  }

  async create(orderSlug: string) {
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

    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.COMPLETED &&
      order.status !== OrderStatus.SHIPPING
    ) {
      this.logger.warn(`Order ${orderSlug} is not paid`, context);
      throw new OrderException(OrderValidation.ORDER_IS_NOT_PAID);
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

    let usedPoints = 0;
    if (order.payment?.paymentMethod === PaymentMethod.POINT) {
      usedPoints = order.subtotal;
    }

    // with: at least one required type
    const orderItemVoucherValue = order.orderItems?.reduce(
      (total, current) => total + current.voucherValue,
      0,
    );

    const originalSubtotalOrder = order.orderItems?.reduce(
      (total, current) => total + current.originalSubtotal,
      0,
    );

    // after calculate promotion
    const subtotalOrderItem = order.orderItems?.reduce(
      (total, current) => total + current.subtotal,
      0,
    );

    let voucherValue = order.loss + orderItemVoucherValue;

    // with: all required type
    if (
      order?.voucher?.applicabilityRule ===
      VoucherApplicabilityRule.ALL_REQUIRED
    ) {
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
        valueEachVoucher: order.voucher?.value ?? 0,
        usedPoints,
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
      // TODO: only paid order can have invoice
      status: OrderStatus.PAID,
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
      voucherRule: order.voucher?.applicabilityRule ?? null,
    });

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
      usedPoints,
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

  async exportTemporaryInvoice(
    requestData: ExportTemporaryInvoiceDto,
  ): Promise<Buffer> {
    const context = `${InvoiceService.name}.${this.exportTemporaryInvoice.name}`;
    const invoice = await this.createTemporaryInvoice(requestData.order);

    const logoPath = resolve('public/images/logo.png');
    const logoBuffer = readFileSync(logoPath);

    // Convert the buffer to a Base64 string
    const logoString = logoBuffer.toString('base64');

    const data = await this.pdfService.generatePdf(
      'temporary-invoice',
      { ...invoice, logoString },
      {
        width: '80mm',
      },
    );

    this.logger.log(
      `Temporary invoice for order ${requestData.order} exported`,
      context,
    );

    return data;
  }

  private async createTemporaryInvoice(orderSlug: string) {
    const context = `${InvoiceService.name}.${this.createTemporaryInvoice.name}`;
    const order = await this.orderRepository.findOne({
      where: { slug: orderSlug },
      relations: [
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

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${orderSlug} is not pending`, context);
      throw new OrderException(OrderValidation.ORDER_IS_NOT_PENDING);
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

    if (
      order?.voucher?.applicabilityRule ===
      VoucherApplicabilityRule.ALL_REQUIRED
    ) {
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
    const qrcode = order?.payment?.qrCode ?? null;
    const amountPayment = order?.payment?.amount ?? 'N/A';
    Object.assign(invoice, {
      order,
      logo: 'https://i.imgur',
      amount: order.subtotal,
      amountPayment,
      loss: order.loss,
      paymentMethod: order?.payment?.paymentMethod ?? 'N/A',
      status: order.status,
      tableName:
        order.type === OrderType.AT_TABLE ? order.table.name : 'take out',
      customer: `${order.owner.firstName} ${order.owner.lastName}`,
      branchAddress: order.branch.address,
      cashier: `${order.approvalBy?.firstName} ${order.approvalBy?.lastName}`,
      invoiceItems,
      expiredAt: moment(order.createdAt).add(15, 'minutes').toDate(),
      exportAt: new Date(),
      qrcode,
      referenceNumber: order.referenceNumber,
      voucherValue,
      voucherId: order.voucher?.id ?? null,
      voucherType: order.voucher?.type ?? null,
      valueEachVoucher: order.voucher?.value ?? null,
      voucherRule: order.voucher?.applicabilityRule ?? null,
    });

    this.logger.log(`Temporary invoice created for order ${order.id}`, context);

    Object.assign(invoice, {
      originalSubtotalOrder,
      subtotalOrderItem,
      orderItemPromotionValue,
      voucherCode: order.voucher?.code ?? 'N/A',
    });

    return invoice;
  }
}
