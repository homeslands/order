import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
  @IsNotEmpty({ message: 'INVALID_VALUE' })
  value: number;

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

export class UpdateVoucherDto extends CreateVoucherDto {
  @ApiProperty()
  @AutoMap()
  @IsOptional()
  isActive?: boolean;
}

export class GetAllVoucherDto {
  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2024-12-26', required: false })
  @AutoMap()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isActive?: boolean;
}

export class GetVoucherDto {
  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  slug: string;

  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  code: string;
}

export class ValidateVoucherDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_SLUG' })
  voucher: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_USER_SLUG' })
  user: string;
}

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

  @ApiProperty()
  @AutoMap()
  value: number;

  @ApiProperty()
  @AutoMap()
  isActive: boolean;

  @ApiProperty()
  @AutoMap()
  remainingUsage: number;
}
