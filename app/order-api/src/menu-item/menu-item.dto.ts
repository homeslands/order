import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
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

  @AutoMap()
  @ApiProperty({ example: true })
  @IsBoolean()
  @Type(() => Boolean)
  isResetCurrentStock: boolean;

  @AutoMap()
  @ApiProperty({ example: true })
  @IsBoolean()
  @Type(() => Boolean)
  // @Transform(({ value }) => value === 'true')
  isLocked: boolean;
}

export class MenuItemResponseDto {
  @AutoMap()
  @ApiProperty()
  defaultStock: number;

  @AutoMap()
  @ApiProperty()
  currentStock: number;

  @AutoMap()
  @ApiProperty()
  isLocked: boolean;

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
