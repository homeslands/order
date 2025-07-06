import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChefOrderUtils } from './chef-order.utils';
import { ChefOrder } from './chef-order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  ChefOrderResponseDto,
  CreateChefOrderRequestDto,
  QueryGetAllChefOrderRequestDto,
  UpdateChefOrderRequestDto,
} from './chef-order.dto';
import _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import ChefOrderValidation from './chef-order.validation';
import { ChefOrderException } from './chef-order.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { ChefOrderStatus } from './chef-order.constants';
import { ChefOrderItemStatus } from 'src/chef-order-item/chef-order-item.constants';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import moment from 'moment';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { PdfService } from 'src/pdf/pdf.service';
import sharp from 'sharp';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import { PDFDocument } from 'pdf-lib';
import { OrderStatus } from 'src/order/order.constants';
import { PrinterUtils } from 'src/printer/printer.utils';
import { PrinterDataType } from 'src/printer/printer.constants';
@Injectable()
export class ChefOrderService {
  constructor(
    @InjectRepository(ChefOrder)
    private readonly chefOrderRepository: Repository<ChefOrder>,
    private readonly chefOrderUtils: ChefOrderUtils,
    private readonly orderUtils: OrderUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly pdfService: PdfService,
    private readonly systemConfigService: SystemConfigService,
    private readonly printerUtils: PrinterUtils,
  ) {}

  async getBarChefOrderItemPrinterIp() {
    return await this.systemConfigService.get(
      SystemConfigKey.BAR_CHEF_ORDER_ITEM_PRINTER_IP,
    );
  }

  async getBarChefOrderItemPrinterPort() {
    return await this.systemConfigService.get(
      SystemConfigKey.BAR_CHEF_ORDER_ITEM_PRINTER_PORT,
    );
  }

  /**
   * Create a new chef order
   * @param {CreateChefOrderRequestDto} requestData - The request data
   * @returns {Promise<ChefOrderResponseDto[]>} - A promise that resolves to an array of chef order response DTOs
   * @throws {ChefOrderException} - If the chef order is not found
   */
  async create(
    requestData: CreateChefOrderRequestDto,
  ): Promise<ChefOrderResponseDto[]> {
    const context = `${ChefOrderService.name}.${this.create.name}`;

    const order = await this.orderUtils.getOrder({
      where: { slug: requestData.order },
    });
    if (!_.isEmpty(order.chefOrders)) {
      this.logger.warn(
        ChefOrderValidation.CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER.message,
        context,
      );
      throw new ChefOrderException(
        ChefOrderValidation.CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER,
      );
    }
    if (order.status !== OrderStatus.PAID) {
      this.logger.warn(ChefOrderValidation.ORDER_MUST_BE_PAID.message, context);
      throw new ChefOrderException(ChefOrderValidation.ORDER_MUST_BE_PAID);
    }

    const chefOrders: ChefOrder[] = await this.chefOrderUtils.createChefOrder(
      order.id,
    );

    return this.mapper.mapArray(chefOrders, ChefOrder, ChefOrderResponseDto);
  }

  /**
   * Get all chef orders
   * @param {QueryGetAllChefOrderRequestDto} query - The query parameters
   * @returns {Promise<ChefOrderResponseDto[]>} - A promise that resolves to an array of chef order response DTOs
   */
  async getAllChefOrders(
    query: QueryGetAllChefOrderRequestDto,
  ): Promise<AppPaginatedResponseDto<ChefOrderResponseDto>> {
    // Build find options
    const findOptions: FindOptionsWhere<ChefOrder> = {
      chefArea: { slug: query.chefArea },
      status: query.status,
    };

    if (query.order) {
      findOptions.order = { slug: query.order };
    }

    if (query.startDate && !query.endDate) {
      throw new ChefOrderException(
        ChefOrderValidation.END_DATE_CAN_NOT_BE_EMPTY,
      );
    }

    if (!query.startDate && query.endDate) {
      throw new ChefOrderException(
        ChefOrderValidation.START_DATE_CAN_NOT_BE_EMPTY,
      );
    }

    if (query.startDate && query.endDate) {
      query.startDate = moment(query.startDate).startOf('day').toDate();
      query.endDate = moment(query.endDate).endOf('day').toDate();
      findOptions.createdAt = Between(query.startDate, query.endDate);
    }

    const [chefOrders, total] = await this.chefOrderRepository.findAndCount({
      where: findOptions,
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
      ],
      order: {
        createdAt: 'DESC',
      },
      skip: (query.page - 1) * query.size,
      take: query.size,
    });

    const totalPages = Math.ceil(total / query.size);

    return {
      totalPages,
      hasPrevios: query.page > 1,
      hasNext: query.page < totalPages,
      page: query.page,
      pageSize: query.size,
      total,
      items: this.mapper.mapArray(chefOrders, ChefOrder, ChefOrderResponseDto),
    };
  }

  /**
   * Get a specific chef order by slug
   * @param {string} slug - The slug of the chef order
   * @returns {Promise<ChefOrderResponseDto>} - A promise that resolves to a chef order response DTO
   * @throws {ChefOrderException} - If the chef order is not found
   */
  async getSpecific(slug: string): Promise<ChefOrderResponseDto> {
    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
      ],
    });

    return this.mapper.map(chefOrder, ChefOrder, ChefOrderResponseDto);
  }

  async exportPdf(slug: string): Promise<Buffer> {
    const context = `${ChefOrderService.name}.${this.exportPdf.name}`;
    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: [
        'chefArea',
        'order.branch',
        'order.table',
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
      ],
    });

    const logoPath = resolve('public/images/logo.png');
    const logoBuffer = readFileSync(logoPath);

    // Convert the buffer to a Base64 string
    const logoString = logoBuffer.toString('base64');

    const branchAddress = chefOrder.order.branch.address;
    const tableName = chefOrder.order.table?.name ?? 'Take out';
    const referenceNumber = chefOrder.order.referenceNumber;
    const areaName = chefOrder.chefArea.name;
    const data = await this.pdfService.generatePdf(
      'chef-order',
      {
        ...chefOrder,
        logoString,
        branchAddress,
        referenceNumber,
        tableName,
        areaName,
      },
      {
        width: '80mm',
      },
    );

    this.logger.log(`Chef order ${chefOrder.slug} exported`, context);

    return data;
  }

  async exportChefOrderItemTicketPdfManual(slug: string): Promise<Buffer> {
    const context = `${ChefOrderService.name}.${this.exportChefOrderItemTicketPdfManual.name}`;
    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
      ],
    });

    if (chefOrder.status !== ChefOrderStatus.ACCEPTED) {
      this.logger.warn(
        ChefOrderValidation.CHEF_ORDER_MUST_BE_ACCEPTED.message,
        context,
      );
      throw new ChefOrderException(
        ChefOrderValidation.CHEF_ORDER_MUST_BE_ACCEPTED,
      );
    }

    const logoPath = resolve('public/images/logo.png');
    const logoBuffer = readFileSync(logoPath);

    // Convert the buffer to a Base64 string
    const logoString = logoBuffer.toString('base64');

    const buffers: Buffer[] = [];
    for (const chefOrderItem of chefOrder.chefOrderItems) {
      const data = await this.pdfService.generatePdf(
        'chef-order-item-ticket',
        {
          productName:
            chefOrderItem?.orderItem?.variant?.product?.name ?? 'N/A',
          referenceNumber: chefOrder?.order?.referenceNumber ?? 'N/A',
          note: chefOrderItem?.orderItem?.note ?? 'N/A',
          logoString,
        },
        {
          width: '50mm',
          height: '30mm',
          preferCSSPageSize: true,
          margin: {
            top: '0cm',
            bottom: '0cm',
            left: '0cm',
            right: '0cm',
          },
          scale: 1,
        },
      );
      buffers.push(data);
    }

    const mergedPdf = await this.mergePdfBuffers(buffers);

    return mergedPdf;
  }

  public async mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of buffers) {
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalPdf = await mergedPdf.save();
    return Buffer.from(finalPdf);
  }

  async convertImageToBitmap(imageBuffer: Buffer): Promise<Buffer> {
    const width = 576;
    const height = 384;
    const data = await sharp(imageBuffer)
      .resize(width, height)
      .grayscale()
      .negate()
      .threshold(128)
      .raw()
      .toBuffer();

    const bytesPerRow = Math.ceil(width / 8);
    const bitmapData = Buffer.alloc(bytesPerRow * height);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const pixelIndex = i * width + j;
        const pixel = data[pixelIndex];

        if (pixel === 0) {
          bitmapData[i * bytesPerRow + (j >> 3)] |= 0x80 >> j % 8;
        }
      }
    }

    return bitmapData;
  }

  async printChefOrderTest(slug: string, maxCount: number) {
    const context = `${ChefOrderService.name}.${this.printChefOrderTest.name}`;
    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
        'order.branch',
        'chefArea.printers',
      ],
    });

    const printers = chefOrder.chefArea.printers;
    const tsplZplPrinters = printers.filter(
      (printer) =>
        printer.dataType === PrinterDataType.TSPL_ZPL && printer.isActive,
    );
    const escPosPrinters = printers.filter(
      (printer) =>
        printer.dataType === PrinterDataType.ESC_POS && printer.isActive,
    );

    if (_.size(tsplZplPrinters) === 0) {
      this.logger.warn(
        `No active raw printer found for chef order: ${chefOrder.slug}`,
      );
    }

    if (_.size(escPosPrinters) === 0) {
      this.logger.warn(
        `No active esc pos printer found for chef order: ${chefOrder.slug}`,
      );
    }

    const bitmapDataList: Buffer[] = [];
    for (const chefOrderItem of chefOrder.chefOrderItems) {
      let data = await this.pdfService.generatePdfImage(
        'chef-order-item-ticket-image',
        {
          productName:
            chefOrderItem?.orderItem?.variant?.product?.name ?? 'N/A',
          referenceNumber: chefOrder?.order?.referenceNumber ?? 'N/A',
          note: chefOrderItem?.orderItem?.note ?? 'N/A',
          variantName: chefOrderItem?.orderItem?.variant?.size?.name ?? 'N/A',
          createdAt: chefOrder?.order?.createdAt ?? 'N/A',
        },
        {
          type: 'png',
          omitBackground: false,
        },
      );
      const bitmapData = await this.convertImageToBitmap(data);
      data = null;
      bitmapDataList.push(bitmapData);
    }

    let shouldContinue = true;
    let count = 0;

    while (shouldContinue) {
      for (const printer of tsplZplPrinters) {
        await this.printerUtils.printChefOrderItemTicket(
          printer.ip,
          printer.port,
          bitmapDataList,
        );
      }
      for (const printer of escPosPrinters) {
        await this.printerUtils.printChefOrder(
          printer.ip,
          printer.port,
          chefOrder,
        );
      }

      count++;
      if (count >= maxCount) {
        shouldContinue = false;
      }
    }
    this.logger.log(
      `Printed ${count} times for chef order: ${chefOrder.slug}`,
      context,
    );
  }

  /**
   * Update a specific chef order
   * @param {string} slug - The slug of the chef order
   * @param {UpdateChefOrderRequestDto} requestData - The request data
   * @returns {Promise<ChefOrderResponseDto>} - A promise that resolves to a chef order response DTO
   * @throws {ChefOrderException} - If the chef order is not found
   */
  async update(
    slug: string,
    requestData: UpdateChefOrderRequestDto,
  ): Promise<ChefOrderResponseDto> {
    const context = `${ChefOrderService.name}.${this.update.name}`;

    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
      ],
    });

    if (requestData.status === ChefOrderStatus.COMPLETED) {
      const completedChefOrderItems = chefOrder.chefOrderItems.filter(
        (item) => item.status === ChefOrderItemStatus.COMPLETED,
      );

      if (
        _.size(chefOrder.chefOrderItems) !== _.size(completedChefOrderItems)
      ) {
        this.logger.warn(
          ChefOrderValidation
            .ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED
            .message,
          context,
        );
        throw new ChefOrderException(
          ChefOrderValidation.ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED,
        );
      }
    }

    if (chefOrder.status !== ChefOrderStatus.PENDING) {
      if (requestData.status === ChefOrderStatus.PENDING) {
        this.logger.warn(
          ChefOrderValidation.CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING
            .message,
          context,
        );
        throw new ChefOrderException(
          ChefOrderValidation.CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING,
        );
      }
    }

    Object.assign(chefOrder, { status: requestData.status });
    const updated = await this.chefOrderRepository.save(chefOrder);
    return this.mapper.map(updated, ChefOrder, ChefOrderResponseDto);
  }
}
