import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { PrinterDataType, PrinterJobType } from './printer.constants';
import { ChefOrder } from 'src/chef-order/chef-order.entity';

export class PrinterResponseDto extends BaseResponseDto {
  @AutoMap()
  name: string;

  @AutoMap()
  dataType: string;

  @AutoMap()
  ip: string;

  @AutoMap()
  port: string;

  @AutoMap()
  description?: string;

  @AutoMap()
  isActive: boolean;
}

export class CreatePrinterRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The name of printer',
    example: 'Printer',
    required: true,
  })
  @IsNotEmpty({ message: 'Name of printer is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The data type of printer',
    example: PrinterDataType.TSPL_ZPL,
    required: true,
  })
  @IsNotEmpty({ message: 'Data type of printer is required' })
  @IsEnum(PrinterDataType, { message: 'Data type of printer is invalid' })
  dataType: string;

  @AutoMap()
  @ApiProperty({
    description: 'The ip of printer',
    example: '192.168.1.1',
    required: true,
  })
  @IsNotEmpty({ message: 'Ip of printer is required' })
  ip: string;

  @AutoMap()
  @ApiProperty({
    description: 'The port of printer',
    example: '9100',
    required: true,
  })
  @IsNotEmpty({ message: 'Port of printer is required' })
  port: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of printer',
    example: 'Printer description',
    required: false,
  })
  @IsOptional()
  description?: string;
}

export class UpdatePrinterRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The name of printer',
    example: 'Printer',
    required: true,
  })
  @IsNotEmpty({ message: 'Name of printer is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The data type of printer',
    example: PrinterDataType.TSPL_ZPL,
    required: true,
  })
  @IsNotEmpty({ message: 'Data type of printer is required' })
  @IsEnum(PrinterDataType, { message: 'Data type of printer is invalid' })
  dataType: string;

  @AutoMap()
  @ApiProperty({
    description: 'The ip of printer',
    example: '192.168.1.1',
    required: true,
  })
  @IsNotEmpty({ message: 'Ip of printer is required' })
  ip: string;

  @AutoMap()
  @ApiProperty({
    description: 'The port of printer',
    example: '9100',
    required: true,
  })
  @IsNotEmpty({ message: 'Port of printer is required' })
  port: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of printer',
    example: 'Printer description',
    required: false,
  })
  @IsOptional()
  description?: string;
}

export class CreatePrintJobRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The type of job',
    example: 'chef_order',
    required: true,
  })
  @IsNotEmpty({ message: 'Type of job is required' })
  @IsEnum(PrinterJobType, { message: 'Type of job is invalid' })
  jobType: string;

  @AutoMap()
  @ApiProperty({
    description: 'The ip of printer',
    example: '192.168.1.1',
    required: true,
  })
  @IsNotEmpty({ message: 'Ip of printer is required' })
  printerIp: string;

  @AutoMap()
  @ApiProperty({
    description: 'The port of printer',
    example: '9100',
    required: true,
  })
  @IsNotEmpty({ message: 'Port of printer is required' })
  printerPort: string;

  @AutoMap()
  @ApiProperty({
    description: 'The bitmap data list of job',
    example: 'Print job',
    required: false,
  })
  @IsOptional()
  bitmapDataList?: Buffer[];

  @AutoMap()
  @ApiProperty({
    description: 'The chef order of job',
    example: 'Print job',
    required: false,
  })
  @IsOptional()
  chefOrder?: ChefOrder;
}
