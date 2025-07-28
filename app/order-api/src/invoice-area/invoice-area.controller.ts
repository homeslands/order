import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceAreaService } from './invoice-area.service';
import { AppResponseDto } from 'src/app/app.dto';
import {
  CreateInvoiceAreaRequestDto,
  InvoiceAreaResponseDto,
  UpdateInvoiceAreaRequestDto,
} from './invoice-area.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreatePrinterRequestDto,
  PrinterResponseDto,
  UpdatePrinterRequestDto,
} from 'src/printer/printer.dto';

@Controller('invoice-area')
@ApiTags('Invoice Area')
@ApiBearerAuth()
export class InvoiceAreaController {
  constructor(private readonly invoiceAreaService: InvoiceAreaService) {}

  @Post()
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Create new invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new invoice area was created successfully',
    type: InvoiceAreaResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreateInvoiceAreaRequestDto,
  ) {
    const result = await this.invoiceAreaService.create(requestData);
    return {
      message: 'The new menu was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<InvoiceAreaResponseDto>;
  }

  @Get('branch/:slug')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Get all invoice areas' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The invoice areas were fetched successfully',
    type: InvoiceAreaResponseDto,
  })
  async getAll(@Param('slug') slug: string) {
    const result = await this.invoiceAreaService.getAll(slug);
    return {
      message: 'The invoice areas were fetched successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<InvoiceAreaResponseDto[]>;
  }

  @Patch(':slug')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Update invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The invoice area was updated successfully',
    type: InvoiceAreaResponseDto,
  })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: UpdateInvoiceAreaRequestDto,
  ) {
    const result = await this.invoiceAreaService.update(slug, requestData);
    return {
      message: 'The invoice area was updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<InvoiceAreaResponseDto>;
  }

  @Delete(':slug')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Delete invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The invoice area was deleted successfully',
    type: String,
  })
  async delete(@Param('slug') slug: string) {
    const result = await this.invoiceAreaService.delete(slug);
    return {
      message: 'The invoice area was deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} invoice area was deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Post(':slug/printer')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Create new printer for invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new printer was created successfully',
    type: PrinterResponseDto,
  })
  async createPrinter(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreatePrinterRequestDto,
  ) {
    const result = await this.invoiceAreaService.createPrinter(
      slug,
      requestData,
    );
    return {
      message: 'The new printer was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto>;
  }

  @Get(':slug/printers')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Get all printers for invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The printers were fetched successfully',
    type: PrinterResponseDto,
  })
  async getAllPrinters(@Param('slug') slug: string) {
    const result = await this.invoiceAreaService.getAllPrinters(slug);
    return {
      message: 'The printers were fetched successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto[]>;
  }

  @Patch(':slug/printer/:printerSlug')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Update printer for invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The printer was updated successfully',
    type: PrinterResponseDto,
  })
  async updatePrinter(
    @Param('slug') slug: string,
    @Param('printerSlug') printerSlug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: UpdatePrinterRequestDto,
  ) {
    const result = await this.invoiceAreaService.updatePrinter(
      slug,
      printerSlug,
      requestData,
    );
    return {
      message: 'The printer was updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto>;
  }

  @Delete(':slug/printer/:printerSlug')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Delete printer for invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The printer was deleted successfully',
    type: String,
  })
  async deletePrinter(
    @Param('slug') slug: string,
    @Param('printerSlug') printerSlug: string,
  ) {
    const result = await this.invoiceAreaService.deletePrinter(
      slug,
      printerSlug,
    );
    return {
      message: 'The printer was deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} printer was deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Patch(':slug/printer/:printerSlug/toggle')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin, RoleEnum.Manager)
  @ApiOperation({ summary: 'Toggle printer for invoice area' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The printer was toggled successfully',
    type: PrinterResponseDto,
  })
  async togglePrinter(
    @Param('slug') slug: string,
    @Param('printerSlug') printerSlug: string,
  ) {
    const result = await this.invoiceAreaService.togglePrinter(
      slug,
      printerSlug,
    );
    return {
      message: 'The printer was toggled successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterResponseDto>;
  }
}
