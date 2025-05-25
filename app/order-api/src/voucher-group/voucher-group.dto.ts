import { IsBoolean, IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

import { AutoMap } from '@automapper/classes';
import { IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/app/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateVoucherGroupRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The title of voucher group',
    example: 'Voucher Group 1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of voucher group',
    example: 'Voucher Group 1 description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateVoucherGroupRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The title of voucher group',
    example: 'Voucher Group 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of voucher group',
    example: 'Voucher Group 1 description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class VoucherGroupResponseDto {
  @AutoMap()
  slug: string;

  @AutoMap()
  title: string;

  @AutoMap()
  description?: string;
}

export class GetAllVoucherGroupRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    description: 'The option has paging or not',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}
