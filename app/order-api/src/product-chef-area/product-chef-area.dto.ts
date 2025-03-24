import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ProductResponseDto } from 'src/product/product.dto';

export class CreateProductChefAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of chef area',
    example: 'chef-area-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of chef area is required' })
  chefArea: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of product',
    example: 'product-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of product is required' })
  product: string;
}

export class CreateManyProductChefAreasRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of chef area',
    example: 'chef-area-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of chef area is required' })
  chefArea: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of product slugs to be created product chef area',
    required: true,
    example: ['product-slug'],
  })
  @IsArray({
    message: 'The slug array of product slugs must be an array',
  })
  @ArrayNotEmpty({
    message: 'The slug array of product slugs must not be empty',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  products: string[];
}

export class UpdateProductChefAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of chef area',
    example: 'chef-area-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of chef area is required' })
  chefArea: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of product',
    example: 'product-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of product is required' })
  product: string;
}

export class QueryGetProductChefAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of chef area',
    example: 'chef-area-slug',
    required: false,
  })
  @IsOptional()
  chefArea?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of product',
    example: 'product-slug',
    required: false,
  })
  @IsOptional()
  product?: string;
}

export class ProductChefAreaResponseDto {
  @AutoMap(() => ChefAreaResponseDto)
  chefArea: ChefAreaResponseDto;

  @AutoMap(() => ProductResponseDto)
  product: ProductResponseDto;
}
