import { Inject, Injectable, Logger } from '@nestjs/common';
import { InvoiceArea } from './invoice-area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Printer } from 'src/printer/entity/printer.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateInvoiceAreaRequestDto,
  InvoiceAreaResponseDto,
  UpdateInvoiceAreaRequestDto,
} from './invoice-area.dto';
import { Branch } from 'src/branch/branch.entity';
import { BranchValidation } from 'src/branch/branch.validation';
import { BranchException } from 'src/branch/branch.exception';
import { InvoiceAreaException } from './invoice-area.exception';
import { InvoiceAreaValidation } from './invoice-area.validation';
import {
  CreatePrinterRequestDto,
  PrinterResponseDto,
  UpdatePrinterRequestDto,
} from 'src/printer/printer.dto';
import { PrinterException } from 'src/printer/printer.exception';
import PrinterValidation from 'src/printer/printer.validation';

@Injectable()
export class InvoiceAreaService {
  constructor(
    @InjectRepository(InvoiceArea)
    private readonly invoiceAreaRepository: Repository<InvoiceArea>,
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(
    requestData: CreateInvoiceAreaRequestDto,
  ): Promise<InvoiceAreaResponseDto> {
    const context = `${InvoiceAreaService.name}.${this.create.name}`;
    this.logger.log('Creating invoice area', context);

    const branch = await this.branchRepository.findOne({
      where: { slug: requestData.branch },
    });
    if (!branch) {
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    const invoiceArea = this.mapper.map(
      requestData,
      CreateInvoiceAreaRequestDto,
      InvoiceArea,
    );
    Object.assign(invoiceArea, { branch });

    const createdInvoiceArea =
      await this.invoiceAreaRepository.save(invoiceArea);

    return this.mapper.map(
      createdInvoiceArea,
      InvoiceArea,
      InvoiceAreaResponseDto,
    );
  }

  async getAll(branch: string): Promise<InvoiceAreaResponseDto[]> {
    const context = `${InvoiceAreaService.name}.${this.getAll.name}`;
    this.logger.log('Getting all invoice areas', context);

    const invoiceAreas = await this.invoiceAreaRepository.find({
      where: { branch: { slug: branch } },
    });

    return this.mapper.mapArray(
      invoiceAreas,
      InvoiceArea,
      InvoiceAreaResponseDto,
    );
  }

  async update(
    slug: string,
    requestData: UpdateInvoiceAreaRequestDto,
  ): Promise<InvoiceAreaResponseDto> {
    const context = `${InvoiceAreaService.name}.${this.update.name}`;
    this.logger.log('Updating invoice area', context);

    const invoiceArea = await this.invoiceAreaRepository.findOne({
      where: { slug: slug },
    });
    if (!invoiceArea) {
      throw new InvoiceAreaException(
        InvoiceAreaValidation.INVOICE_AREA_NOT_FOUND,
      );
    }

    const invoiceAreaData = this.mapper.map(
      requestData,
      UpdateInvoiceAreaRequestDto,
      InvoiceArea,
    );
    Object.assign(invoiceArea, { ...invoiceAreaData });

    const updatedInvoiceArea =
      await this.invoiceAreaRepository.save(invoiceArea);

    this.logger.log('Invoice area updated', context);

    return this.mapper.map(
      updatedInvoiceArea,
      InvoiceArea,
      InvoiceAreaResponseDto,
    );
  }

  async delete(slug: string): Promise<number> {
    const context = `${InvoiceAreaService.name}.${this.delete.name}`;
    this.logger.log('Deleting invoice area', context);

    const invoiceArea = await this.invoiceAreaRepository.findOne({
      where: { slug: slug },
    });
    if (!invoiceArea) {
      throw new InvoiceAreaException(
        InvoiceAreaValidation.INVOICE_AREA_NOT_FOUND,
      );
    }

    const deleted = await this.invoiceAreaRepository.delete(invoiceArea.id);

    this.logger.log('Invoice area deleted', context);

    return deleted.affected || 0;
  }

  async createPrinter(
    slug: string,
    requestData: CreatePrinterRequestDto,
  ): Promise<PrinterResponseDto> {
    const context = `${InvoiceAreaService.name}.${this.createPrinter.name}`;
    this.logger.log('Creating printer', context);

    const invoiceArea = await this.invoiceAreaRepository.findOne({
      where: { slug: slug },
    });
    if (!invoiceArea) {
      throw new InvoiceAreaException(
        InvoiceAreaValidation.INVOICE_AREA_NOT_FOUND,
      );
    }

    const existingPrinter = await this.printerRepository.findOne({
      where: {
        ip: requestData.ip,
        port: requestData.port,
        dataType: requestData.dataType,
        invoiceArea: { id: invoiceArea.id },
      },
    });

    if (existingPrinter) {
      this.logger.log('Printer for invoice area already exists', context);
      throw new PrinterException(PrinterValidation.PRINTER_ALREADY_EXISTS);
    }

    const printer = this.mapper.map(
      requestData,
      CreatePrinterRequestDto,
      Printer,
    );
    Object.assign(printer, { invoiceArea });

    const createdPrinter = await this.printerRepository.save(printer);

    this.logger.log('Printer created', context);

    return this.mapper.map(createdPrinter, Printer, PrinterResponseDto);
  }

  async getAllPrinters(slug: string): Promise<PrinterResponseDto[]> {
    const invoiceArea = await this.invoiceAreaRepository.findOne({
      where: { slug: slug },
    });
    if (!invoiceArea) {
      throw new InvoiceAreaException(
        InvoiceAreaValidation.INVOICE_AREA_NOT_FOUND,
      );
    }
    const printers = await this.printerRepository.find({
      where: { invoiceArea: { id: invoiceArea.id } },
    });
    return this.mapper.mapArray(printers, Printer, PrinterResponseDto);
  }

  async updatePrinter(
    slug: string,
    printerSlug: string,
    requestData: UpdatePrinterRequestDto,
  ): Promise<PrinterResponseDto> {
    const context = `${InvoiceAreaService.name}.${this.updatePrinter.name}`;
    this.logger.log('Updating printer', context);

    const printer = await this.printerRepository.findOne({
      where: { slug: printerSlug, invoiceArea: { slug } },
    });
    if (!printer) {
      throw new PrinterException(PrinterValidation.PRINTER_NOT_FOUND);
    }

    const invoiceArea = await this.invoiceAreaRepository.findOne({
      where: { slug: slug },
    });
    if (!invoiceArea) {
      throw new InvoiceAreaException(
        InvoiceAreaValidation.INVOICE_AREA_NOT_FOUND,
      );
    }

    Object.assign(printer, { ...requestData });

    const updatedPrinter = await this.printerRepository.save(printer);

    this.logger.log('Printer updated', context);

    return this.mapper.map(updatedPrinter, Printer, PrinterResponseDto);
  }

  async deletePrinter(slug: string, printerSlug: string): Promise<number> {
    const context = `${InvoiceAreaService.name}.${this.deletePrinter.name}`;

    const printer = await this.printerRepository.findOne({
      where: { slug: printerSlug, invoiceArea: { slug } },
    });
    if (!printer) {
      throw new PrinterException(PrinterValidation.PRINTER_NOT_FOUND);
    }

    const deleted = await this.printerRepository.softDelete(printer.id);

    this.logger.log('Printer deleted', context);

    return deleted.affected || 0;
  }

  async togglePrinter(
    slug: string,
    printerSlug: string,
  ): Promise<PrinterResponseDto> {
    const context = `${InvoiceAreaService.name}.${this.togglePrinter.name}`;
    this.logger.log('Toggling printer', context);

    const printer = await this.printerRepository.findOne({
      where: { slug: printerSlug, invoiceArea: { slug } },
    });
    if (!printer) {
      throw new PrinterException(PrinterValidation.PRINTER_NOT_FOUND);
    }

    Object.assign(printer, { isActive: !printer.isActive });

    const updatedPrinter = await this.printerRepository.save(printer);

    this.logger.log('Printer toggled', context);

    return this.mapper.map(updatedPrinter, Printer, PrinterResponseDto);
  }
}
