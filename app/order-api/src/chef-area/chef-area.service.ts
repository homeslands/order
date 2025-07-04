import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChefArea } from './chef-area.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefAreaUtils } from './chef-area.utils';
import {
  ChefAreaResponseDto,
  CreateChefAreaRequestDto,
  QueryGetChefAreaRequestDto,
  UpdateChefAreaRequestDto,
} from './chef-area.dto';
import { BranchUtils } from 'src/branch/branch.utils';
import {
  CreatePrinterRequestDto,
  PrinterResponseDto,
  UpdatePrinterRequestDto,
} from 'src/printer/printer.dto';
import { Printer } from 'src/printer/printer.entity';
import PrinterValidation from 'src/printer/printer.validation';
import { PrinterException } from 'src/printer/printer.exception';
import { PrinterDataType } from 'src/printer/printer.constants';
import sharp from 'sharp';
import { PdfService } from 'src/pdf/pdf.service';
import { PrinterUtils } from 'src/printer/printer.utils';
import { ChefOrder } from 'src/chef-order/chef-order.entity';

@Injectable()
export class ChefAreaService {
  constructor(
    @InjectRepository(ChefArea)
    private chefAreaRepository: Repository<ChefArea>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly chefAreaUtils: ChefAreaUtils,
    private readonly branchUtils: BranchUtils,
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
    private readonly pdfService: PdfService,
    private readonly printerUtils: PrinterUtils,
  ) {}

  /**
   * Create new chef area
   * @param {CreateChefAreaRequestDto} requestData
   * @returns {ChefAreaResponseDto}
   * @throws {BranchException} if branch not found
   */
  async create(
    requestData: CreateChefAreaRequestDto,
  ): Promise<ChefAreaResponseDto> {
    const branch = await this.branchUtils.getBranch({
      where: { slug: requestData.branch },
    });
    const chefArea = this.mapper.map(
      requestData,
      CreateChefAreaRequestDto,
      ChefArea,
    );
    Object.assign(chefArea, {
      branch,
    });
    const createdChefArea = await this.chefAreaRepository.save(chefArea);
    return this.mapper.map(createdChefArea, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Get all chef areas
   * @param {QueryGetChefAreaRequestDto} query
   * @returns {ChefAreaResponseDto[]}
   * @throws {BranchException} if branch not found
   */
  async getAll(
    query: QueryGetChefAreaRequestDto,
  ): Promise<ChefAreaResponseDto[]> {
    const where: FindOneOptions<ChefArea> = { relations: ['branch'] };
    if (query.branch) {
      const branch = await this.branchUtils.getBranch({
        where: { slug: query.branch },
      });
      where.where = {
        branch: { id: branch.id },
      };
    }

    const chefAreas = await this.chefAreaRepository.find(where);
    return this.mapper.mapArray(chefAreas, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Get specific chef area
   * @param {string} slug
   * @returns {ChefAreaResponseDto}
   * @throws {ChefAreaException} if chef area not found
   */
  async getSpecific(slug: string): Promise<ChefAreaResponseDto> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
      relations: ['branch', 'productChefAreas.product'],
    });
    return this.mapper.map(chefArea, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Update chef area
   * @param {string} slug
   * @param {CreateChefAreaRequestDto} requestData
   * @returns {ChefAreaResponseDto}
   * @throws {ChefAreaException} if chef area not found
   * @throws {BranchException} if branch not found
   */
  async update(
    slug: string,
    requestData: CreateChefAreaRequestDto,
  ): Promise<ChefAreaResponseDto> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
    });
    const branch = await this.branchUtils.getBranch({
      where: { slug: requestData.branch },
    });
    const chefAreaData = this.mapper.map(
      requestData,
      UpdateChefAreaRequestDto,
      ChefArea,
    );
    Object.assign(chefArea, {
      ...chefAreaData,
      branch,
    });
    const updatedChefArea = await this.chefAreaRepository.save(chefArea);
    return this.mapper.map(updatedChefArea, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Delete chef area
   * @param {string} slug
   * @returns {number}
   * @throws {ChefAreaException} if chef area not found
   */
  async delete(slug: string): Promise<number> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
    });
    const deleted = await this.chefAreaRepository.softDelete(chefArea.id);
    return deleted.affected || 0;
  }

  async createPrinter(
    slug: string,
    requestData: CreatePrinterRequestDto,
  ): Promise<PrinterResponseDto> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
    });

    const existingPrinter = await this.printerRepository.findOne({
      where: {
        ip: requestData.ip,
        port: requestData.port,
        dataType: requestData.dataType,
        chefArea: { id: chefArea.id },
      },
    });
    if (existingPrinter) {
      throw new PrinterException(PrinterValidation.PRINTER_ALREADY_EXISTS);
    }

    const printer = this.mapper.map(
      requestData,
      CreatePrinterRequestDto,
      Printer,
    );
    Object.assign(printer, {
      chefArea,
    });

    const createdPrinter = await this.printerRepository.save(printer);

    return this.mapper.map(createdPrinter, Printer, PrinterResponseDto);
  }

  async getAllPrinters(slug: string): Promise<PrinterResponseDto[]> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
    });
    const printers = await this.printerRepository.find({
      where: { chefArea: { id: chefArea.id } },
    });
    return this.mapper.mapArray(printers, Printer, PrinterResponseDto);
  }

  async deletePrinter(slug: string, printerSlug: string): Promise<number> {
    const printer = await this.printerRepository.findOne({
      where: { slug: printerSlug, chefArea: { slug } },
    });
    if (!printer) {
      throw new PrinterException(PrinterValidation.PRINTER_NOT_FOUND);
    }
    const deleted = await this.printerRepository.softDelete(printer.id);
    return deleted.affected || 0;
  }

  async updatePrinter(
    slug: string,
    printerSlug: string,
    requestData: UpdatePrinterRequestDto,
  ): Promise<PrinterResponseDto> {
    const printer = await this.printerRepository.findOne({
      where: { slug: printerSlug, chefArea: { slug } },
    });
    if (!printer) {
      throw new PrinterException(PrinterValidation.PRINTER_NOT_FOUND);
    }

    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
    });

    Object.assign(printer, {
      ...requestData,
      chefArea,
    });
    const savedPrinter = await this.printerRepository.save(printer);
    return this.mapper.map(savedPrinter, Printer, PrinterResponseDto);
  }

  async togglePrinter(
    slug: string,
    printerSlug: string,
  ): Promise<PrinterResponseDto> {
    const printer = await this.printerRepository.findOne({
      where: { slug: printerSlug, chefArea: { slug } },
    });
    if (!printer) {
      throw new PrinterException(PrinterValidation.PRINTER_NOT_FOUND);
    }
    Object.assign(printer, {
      isActive: !printer.isActive,
    });
    const savedPrinter = await this.printerRepository.save(printer);
    return this.mapper.map(savedPrinter, Printer, PrinterResponseDto);
  }

  async pingPrinter(slug: string, printerSlug: string) {
    const context = `${ChefAreaService.name}.${this.pingPrinter.name}`;
    const printer = await this.printerRepository.findOne({
      where: { slug: printerSlug, chefArea: { slug } },
    });
    if (!printer) {
      this.logger.warn(PrinterValidation.PRINTER_NOT_FOUND.message, context);
      throw new PrinterException(PrinterValidation.PRINTER_NOT_FOUND);
    }
    if (!printer.isActive) {
      this.logger.warn(
        `${PrinterValidation.PRINTER_NOT_ACTIVE.message} ${printer.slug} ${printer.ip}:${printer.port}`,
        context,
      );
      throw new PrinterException(PrinterValidation.PRINTER_NOT_ACTIVE);
    }
    this.logger.log(`Pinging printer ${printer.ip}:${printer.port}`, context);
    if (printer.dataType === PrinterDataType.ESC_POS) {
      const chefOrder = {
        status: 'pending',
        order: {
          referenceNumber: 2630,
          subtotal: 35000,
          loss: 0,
          status: 'paid',
          description: '',
          type: 'at-table',
          table: {
            name: 'Bàn test',
            location: null,
            status: 'reserved',
            createdAt: 'Sat Apr 19 2025 09:05:09 GMT+0700 (Indochina Time)',
            slug: 'b20d534ba3',
          },
          branch: {
            name: 'Chi nhánh test',
            createdAt: 'Fri Jul 04 2025 09:05:49 GMT+0700 (Indochina Time)',
            slug: 'c59a6e5200',
          },
          createdAt: 'Fri Jul 04 2025 09:05:49 GMT+0700 (Indochina Time)',
          slug: 'd499e93e23',
        },
        chefOrderItems: [
          {
            status: 'pending',
            defaultQuantity: 1,
            orderItem: {
              quantity: 1,
              subtotal: 35000,
              note: '',
              discountType: 'none',
              voucherValue: 0,
              variant: {
                price: 35000,
                size: {
                  name: 'Size test',
                  description: 'Size test',
                  createdAt:
                    'Sun Mar 23 2025 14:17:50 GMT+0700 (Indochina Time)',
                  slug: 'ab61528f7f',
                },
                product: {
                  name: 'Sản phẩm test',
                  description: 'Sản phẩm test',
                  isActive: true,
                  isLimit: false,
                  image: '8-1748322238848',
                  rating: null,
                  isTopSell: false,
                  isNew: false,
                  isCombo: false,
                  saleQuantityHistory: 636,
                  images: null,
                  createdAt:
                    'Sun Mar 23 2025 14:00:37 GMT+0700 (Indochina Time)',
                  slug: '23f99adf51',
                },
                createdAt: 'Mon Mar 24 2025 09:16:47 GMT+0700 (Indochina Time)',
                slug: 'd5de540d4c',
              },
              createdAt: 'Fri Jul 04 2025 09:05:49 GMT+0700 (Indochina Time)',
              slug: 'c59a6e5200',
            },
            chefOrder: {
              createdAt: 'Fri Jul 04 2025 09:05:49 GMT+0700 (Indochina Time)',
              slug: 'c59a6e5200',
            },
            createdAt: 'Fri Jul 04 2025 09:09:33 GMT+0700 (Indochina Time)',
            slug: 'a561f99b77',
          },
        ],
        createdAt: 'Fri Jul 04 2025 09:09:33 GMT+0700 (Indochina Time)',
        slug: 'e11820939b',
      } as unknown as ChefOrder;

      await this.printerUtils.printChefOrder(
        printer.ip,
        printer.port,
        chefOrder,
      );
    } else if (printer.dataType === PrinterDataType.TSPL_ZPL) {
      const data = await this.pdfService.generatePdfImage(
        'chef-order-item-ticket-image',
        {
          productName: 'Sản phẩm test',
          referenceNumber: 'Số hóa đơn test',
          note: 'Ghi chú test',
          variantName: 'Size test',
          createdAt: '2025-01-01',
        },
        {
          type: 'png',
          omitBackground: false,
        },
      );
      const bitmapData = await this.convertImageToBitmap(data);
      await this.printerUtils.printChefOrderItemTicket(
        printer.ip,
        printer.port,
        [bitmapData],
      );
    } else {
      this.logger.warn(
        `${PrinterValidation.UN_SUPPORTED_PRINTER_TYPE.message} ${printer.slug} ${printer.ip}:${printer.port}`,
        context,
      );
      throw new PrinterException(PrinterValidation.UN_SUPPORTED_PRINTER_TYPE);
    }
    this.logger.log(
      `Ping printer ${printer.slug} ${printer.ip}:${printer.port} successfully`,
      context,
    );
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
}
