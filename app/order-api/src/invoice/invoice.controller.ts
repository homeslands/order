import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Query,
  ValidationPipe,
  StreamableFile,
  HttpCode,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  ExportInvoiceDto,
  GetSpecificInvoiceRequestDto,
  InvoiceResponseDto,
} from './invoice.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('invoice')
@ApiTags('Invoice')
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('specific')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'slug', required: false })
  @ApiOperation({ summary: 'Get specific invoice' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Invoice retrieved successfully',
    type: InvoiceResponseDto,
  })
  async getSpecificInvoice(
    @Query(new ValidationPipe({ transform: true }))
    query: GetSpecificInvoiceRequestDto,
  ) {
    const result = await this.invoiceService.getSpecificInvoice(query);
    return {
      result,
      message: 'Invoice retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<InvoiceResponseDto>;
  }

  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Get('specific/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'slug', required: false })
  @ApiOperation({ summary: 'Get specific invoice public' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Invoice retrieved successfully',
    type: InvoiceResponseDto,
  })
  async getSpecificInvoicePublic(
    @Query(new ValidationPipe({ transform: true }))
    query: GetSpecificInvoiceRequestDto,
  ) {
    const result = await this.invoiceService.getSpecificInvoice(query);
    return {
      result,
      message: 'Invoice retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<InvoiceResponseDto>;
  }

  @Post('export')
  @ApiOperation({ summary: 'Export invoice' })
  @HttpCode(HttpStatus.OK)
  async exportInvoice(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ExportInvoiceDto,
  ): Promise<StreamableFile> {
    const result = await this.invoiceService.exportInvoice(requestData);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="invoice-${new Date().toISOString()}.pdf"`,
    });
  }

  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post('export/public')
  @Public()
  @ApiOperation({ summary: 'Export invoice public' })
  @HttpCode(HttpStatus.OK)
  async exportInvoicePublic(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ExportInvoiceDto,
  ): Promise<StreamableFile> {
    const result = await this.invoiceService.exportInvoice(requestData);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="invoice-${new Date().toISOString()}.pdf"`,
    });
  }
}
