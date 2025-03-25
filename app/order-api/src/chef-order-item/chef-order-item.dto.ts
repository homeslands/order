import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { ChefOrderResponseDto } from 'src/chef-order/chef-order.dto';
import { OrderItemResponseDto } from 'src/order-item/order-item.dto';
import { ChefOrderItemStatus } from './chef-order-item.constants';

export class ChefOrderItemResponseDto extends BaseResponseDto {
  @AutoMap()
  status: string;

  @AutoMap()
  defaultQuantity: number;

  @AutoMap(() => OrderItemResponseDto)
  orderItem: OrderItemResponseDto;

  @AutoMap(() => ChefOrderResponseDto)
  chefOrder: ChefOrderResponseDto;
}

export class UpdateChefOrderItemRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: 'in-progress',
    required: false,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ChefOrderItemStatus, {
    message: 'Status must be in-progress or completed',
  })
  status: string;
}
