import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { ProductResponseDto } from 'src/product/product.dto';
import { RoleEnum } from 'src/role/role.enum';
import { SizeResponseDto } from 'src/size/size.dto';

export class CreateVariantRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The price of product at this size',
    example: '50000',
  })
  @IsNotEmpty({ message: 'The price is required' })
  @Min(0, { message: 'The price must be greater or equal to 0' })
  price: number;

  @AutoMap()
  @ApiProperty({
    description: 'The cost price of product at this size',
    example: '50000',
    required: false,
  })
  @IsOptional()
  @Min(0, { message: 'The cost price must be greater or equal to 0' })
  costPrice?: number;

  @ApiProperty({ description: 'The slug of size', example: 'XOT7hr58Q' })
  @IsNotEmpty({ message: 'The slug of size is required' })
  size: string;

  @ApiProperty({
    description: 'The slug of product',
    example: 'XOT7hr58Q',
  })
  @IsNotEmpty({ message: 'The slug of product is required' })
  product: string;
}

export class UpdateVariantRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The price of product at this size',
    example: '50000',
  })
  @IsNotEmpty({ message: 'The price is required' })
  @Min(0, { message: 'The price must be greater or equal to 0' })
  price: number;

  @AutoMap()
  @ApiProperty({
    description: 'The price of product at this size',
    example: '50000',
  })
  @IsNotEmpty({ message: 'The price is required' })
  @Min(0, { message: 'The cost price must be greater or equal to 0' })
  costPrice: number;
}

export class VariantResponseDto extends BaseResponseDto {
  @AutoMap()
  price: number;

  @AutoMap()
  @Expose({ groups: [RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager] })
  costPrice: number;

  @AutoMap(() => SizeResponseDto)
  size: SizeResponseDto;

  @AutoMap(() => ProductResponseDto)
  product: ProductResponseDto;
}
