import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ProductResponseDto } from 'src/product/product.dto';
import { PromotionResponseDto } from 'src/promotion/promotion.dto';

export class CreateMenuItemDto {
  @AutoMap()
  @IsNotEmpty()
  @ApiProperty()
  menuSlug: string;

  @AutoMap()
  @IsNotEmpty()
  @ApiProperty()
  productSlug: string;

  @AutoMap()
  @IsNumber()
  @ApiProperty({ example: 50 })
  defaultStock: number;
}

export class GetMenuItemQueryDto {
  @ApiProperty()
  @AutoMap()
  menu: string;

  @AutoMap()
  @ApiProperty({ required: false })
  catalog: string;

  @AutoMap()
  @ApiProperty({ required: false })
  productName: string;

  @AutoMap()
  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  minPrice: number;

  @AutoMap()
  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  maxPrice: number;
}

export class UpdateMenuItemDto {
  @AutoMap()
  @IsNumber()
  @ApiProperty({ example: 50 })
  defaultStock: number;
}

export class MenuItemResponseDto {
  @AutoMap()
  @ApiProperty()
  defaultStock: number;

  @AutoMap()
  @ApiProperty()
  currentStock: number;

  // @AutoMap()
  // @ApiProperty()
  // promotionValue: number;

  @AutoMap(() => PromotionResponseDto)
  @ApiProperty()
  promotion: PromotionResponseDto;

  @AutoMap(() => ProductResponseDto)
  @ApiProperty()
  product: ProductResponseDto;
}
