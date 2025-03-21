import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
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
