import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';

export class CreateVoucherDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_TITLE' })
  @AutoMap()
  title: string;

  @ApiProperty()
  @AutoMap()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_CODE' })
  code: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_MAX_USAGE' })
  maxUsage: number;

  @ApiProperty()
  @AutoMap()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2024-12-26' })
  @AutoMap()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2024-12-30' })
  @AutoMap()
  @Type(() => Date)
  endDate: Date;
}

export class UpdateVoucherDto extends CreateVoucherDto {}

export class VoucherResponseDto extends BaseResponseDto {
  @ApiProperty()
  @AutoMap()
  title: string;

  @ApiProperty()
  @AutoMap()
  description: string;

  @ApiProperty()
  @AutoMap()
  code: string;

  @ApiProperty()
  @AutoMap()
  maxUsage: number;

  @ApiProperty()
  @AutoMap()
  minOrderValue: number;

  @ApiProperty()
  @AutoMap()
  startDate: Date;

  @ApiProperty()
  @AutoMap()
  endDate: Date;
}
