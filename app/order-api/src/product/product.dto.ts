import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { CatalogResponseDto } from 'src/catalog/catalog.dto';
import { VariantResponseDto } from 'src/variant/variant.dto';
import {
  PRODUCT_ACTIVE_REQUIRED,
  PRODUCT_LIMIT_REQUIRED,
  PRODUCT_NAME_REQUIRED,
} from './product.validation';
import { Transform, Type } from 'class-transformer';

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

  @AutoMap()
  @ApiProperty({
    description: 'The option get product is to sell',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  isTopSell?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The option get product is new',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true')
  isNew?: boolean;
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
  @Type(() => Boolean)
  isLimit: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The quantity of product for default stock of menu item',
    example: true,
  })
  @IsOptional()
  defaultQuantity?: number;

  @AutoMap()
  @ApiProperty({ description: 'The active of product', example: false })
  @IsNotEmpty({ message: PRODUCT_ACTIVE_REQUIRED })
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;

  @ApiProperty({
    description: 'The slug of catalog',
    example: 'slug-catalog-123',
  })
  @IsNotEmpty({ message: 'The slug of catalog is required' })
  catalog: string;

  @AutoMap()
  @ApiProperty({
    description: 'The option get product is to sell',
    example: true,
    required: false,
  })
  @IsNotEmpty({ message: 'The isTopSell field is required' })
  @IsBoolean()
  @Type(() => Boolean)
  isTopSell: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The option get product is new',
    example: true,
    required: false,
  })
  @IsNotEmpty({ message: 'The isNew field is required' })
  @IsBoolean()
  @Type(() => Boolean)
  isNew: boolean;
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

  @AutoMap()
  isTopSell: boolean;

  @AutoMap()
  isNew: boolean;

  @AutoMap()
  saleQuantityHistory: number;
}

export class ValidationError {
  row: number;
  errors: { [key: string]: string };
}

export class GetProductRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of catalog',
    example: '',
    required: false,
  })
  @IsOptional()
  catalog?: string;

  @AutoMap()
  @ApiProperty({
    description: 'Get products base on promotion',
    example: '',
    required: false,
  })
  @IsOptional()
  promotion?: string;

  @AutoMap()
  @ApiProperty({
    description: 'Get products that are either applied to a promotion or not',
    example: '',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isAppliedPromotion?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'Get products base on branch is applied for chef area',
    example: '',
    required: false,
  })
  @IsOptional()
  branch?: string;

  @AutoMap()
  @ApiProperty({
    description:
      'Get products that are either applied to a chef area of branch or not',
    example: '',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isAppliedBranchForChefArea?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'Get products base on menu',
    example: '',
    required: false,
  })
  @IsOptional()
  menu?: string;

  @AutoMap()
  @ApiProperty({
    description: 'Get products that are either assigned to a menu or not',
    example: '',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  inMenu?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The option get product is top sell',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isTopSell?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The option get product is new',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isNew?: boolean;
}
