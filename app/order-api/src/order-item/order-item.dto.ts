import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { MenuItemActionType } from 'src/menu-item/menu-item.constants';
import { PromotionResponseDto } from 'src/promotion/promotion.dto';
import { TrackingOrderItemResponseDto } from 'src/tracking-order-item/tracking-order-item.dto';
import { VariantResponseDto } from 'src/variant/variant.dto';

export class CreateOrderItemRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The quantity of order item', example: 2 })
  @IsNotEmpty({ message: 'Invalid quantity of order item' })
  @Min(1, { message: 'Invalid quantity of order item' })
  quantity: number;

  @AutoMap()
  @ApiProperty({ description: 'The note of order item', example: 'Ghi chú' })
  @IsOptional()
  note?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of variant',
    example: 'variant-slug-123',
  })
  @IsNotEmpty({ message: 'Invalid slug of variant' })
  variant: string;

  @AutoMap()
  @ApiProperty({ description: 'The slug of promotion', example: 'promotion-slug-123' })
  @IsOptional()
  promotion?: string;

  @AutoMap()
  @ApiProperty({ description: 'The slug of order', example: 'order-slug-123' })
  @IsOptional()
  order?: string;
}

export class UpdateOrderItemRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The quantity of order item', example: 2 })
  @IsNotEmpty({ message: 'Invalid quantity of order item' })
  @Min(1, { message: 'Invalid quantity of order item' })
  quantity: number;

  @AutoMap()
  @ApiProperty({ description: 'The note of order item', example: 'Ghi chú' })
  @IsOptional()
  note?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of variant',
    example: 'variant-slug-123',
  })
  @IsNotEmpty({ message: 'Invalid slug of variant' })
  variant: string;

  @AutoMap()
  @ApiProperty({ description: `The slug of promotion`, example: 'promotion-slug-123' })
  @IsOptional()
  promotion?: string;

  @AutoMap()
  @ApiProperty({ description: `increment or decrement`, example: 'increment' })
  @IsOptional()
  action?: 'increment' | 'decrement';
}

export class StatusOrderItemResponseDto {
  @AutoMap()
  PENDING: number;

  @AutoMap()
  RUNNING: number;

  @AutoMap()
  COMPLETED: number;

  @AutoMap()
  FAILED: number;
}

export class OrderItemResponseDto extends BaseResponseDto {
  @AutoMap()
  quantity: number;

  @AutoMap()
  subtotal: number;

  @AutoMap()
  note: string;

  @AutoMap(() => VariantResponseDto)
  variant: VariantResponseDto;

  @AutoMap(() => [TrackingOrderItemResponseDto])
  trackingOrderItems: TrackingOrderItemResponseDto[];

  @AutoMap(() => StatusOrderItemResponseDto)
  status: StatusOrderItemResponseDto;

  @AutoMap(() => PromotionResponseDto)
  promotion: PromotionResponseDto;
}
