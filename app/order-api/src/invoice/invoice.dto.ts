import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { InvoiceItemResponseDto } from 'src/invoice-item/invoice-item.dto';

export class ExportInvoiceDto {
  @AutoMap()
  @ApiProperty()
  order: string;
}

export class GetSpecificInvoiceRequestDto {
  @AutoMap()
  @ApiProperty()
  @IsOptional()
  order?: string;

  @AutoMap()
  @IsOptional()
  @ApiProperty()
  slug?: string;
}

export class InvoiceResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  paymentMethod: string;

  @AutoMap()
  @ApiProperty()
  amount: number;

  @AutoMap()
  @ApiProperty()
  referenceNumber: number;

  @AutoMap()
  @ApiProperty()
  status: string;

  @AutoMap()
  @ApiProperty()
  logo: string;

  @AutoMap()
  @ApiProperty()
  tableName: string;

  @AutoMap()
  @ApiProperty()
  branchAddress: string;

  @AutoMap()
  @ApiProperty()
  cashier: string;

  @AutoMap()
  @ApiProperty()
  customer: string;

  @AutoMap(() => InvoiceItemResponseDto)
  @ApiProperty()
  invoiceItems: InvoiceItemResponseDto[];
}
