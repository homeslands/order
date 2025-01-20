import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { OrderItemResponseDto } from 'src/order-item/order-item.dto';
import { OrderItem } from 'src/order-item/order-item.entity';
import { TrackingResponseDto } from 'src/tracking/tracking.dto';

export class CreateTrackingOrderItemRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of order item',
    example: 'order-item-slug',
  })
  @IsNotEmpty({ message: 'Invalid slug of order item' })
  orderItem: string;

  @AutoMap()
  @ApiProperty({ description: 'The quantity of order item', example: 5 })
  @IsNotEmpty({ message: 'Invalid quantity of order item' })
  @Min(1, { message: 'Invalid quantity of order item' })
  quantity: number;
}

export class CreateTrackingOrderItemWithQuantityAndOrderItemEntity {
  quantity: number;

  orderItem: OrderItem;
}

export class ValidateDefinedAndQuantityOrderItem {
  isValid: Boolean;

  orderItemsData?: CreateTrackingOrderItemWithQuantityAndOrderItemEntity[];
}

export class TrackingOrderItemResponseDto extends BaseResponseDto {
  @AutoMap()
  quantity: number;

  @AutoMap()
  tracking: TrackingResponseDto;

  @AutoMap()
  orderItem: OrderItemResponseDto;
}
