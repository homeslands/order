import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { CatalogResponseDto } from 'src/catalog/catalog.dto';
import { VariantResponseDto } from 'src/variant/variant.dto';
import {
  PRODUCT_ACTIVE_REQUIRED,
  PRODUCT_LIMIT_REQUIRED,
  PRODUCT_NAME_REQUIRED,
} from './product.validation';

export class CreateProductRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The name of product', example: 'Cà phê' })
  @IsNotEmpty({ message: PRODUCT_NAME_REQUIRED })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of product',
    example: 'Mô tả cà phê',
  })
  @IsOptional()
  description?: string;

  @AutoMap()
  @ApiProperty({ description: 'The limit of product', example: true })
  @IsNotEmpty({ message: PRODUCT_LIMIT_REQUIRED })
  isLimit: boolean;

  @ApiProperty({
    description: 'The slug of catalog',
    example: 'XOT7hr58Q',
  })
  @IsNotEmpty({ message: 'The slug of catalog is required' })
  catalog: string;
}

export class UpdateProductRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The name of product', example: 'Cà phê' })
  @IsNotEmpty({ message: PRODUCT_NAME_REQUIRED })
  name: string;

  @AutoMap()
  @ApiProperty({ description: 'The description of product', example: 'Lưu ý' })
  @IsOptional()
  description?: string;

  @AutoMap()
  @ApiProperty({ description: 'The limit of product', example: true })
  @IsNotEmpty({ message: PRODUCT_LIMIT_REQUIRED })
  isLimit: boolean;

  @AutoMap()
  @ApiProperty({ description: 'The active of product', example: false })
  @IsNotEmpty({ message: PRODUCT_ACTIVE_REQUIRED })
  isActive: boolean;

  @ApiProperty({
    description: 'The slug of catalog',
    example: 'slug-catalog-123',
  })
  @IsNotEmpty({ message: 'The slug of catalog is required' })
  catalog: string;
}

export class ProductResponseDto extends BaseResponseDto {
  @AutoMap()
  name: string;

  @AutoMap()
  description?: string;

  @AutoMap()
  isActive: boolean;

  @AutoMap()
  isLimit: boolean;

  @AutoMap()
  image?: string;

  @AutoMap()
  images?: string;

  @AutoMap()
  rating?: string;

  @AutoMap(() => CatalogResponseDto)
  catalog: CatalogResponseDto;

  @AutoMap(() => VariantResponseDto)
  variants: VariantResponseDto[];
}

export class ValidationError {
  row: number;
  errors: { [key: string]: string };
}
