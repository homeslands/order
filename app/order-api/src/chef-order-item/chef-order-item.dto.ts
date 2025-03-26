import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { ChefOrderResponseDto } from 'src/chef-order/chef-order.dto';
import { OrderItemResponseDto } from 'src/order-item/order-item.dto';
import { ChefOrderItemStatus } from './chef-order-item.constants';
import { Type } from 'class-transformer';

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

export class UpdateMultiChefOrderItemRequestDto {
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

  @AutoMap()
  @ApiProperty({
    description: 'The array of chef order item slugs',
    required: true,
    example: ['chef-order-item-slug'],
  })
  @IsArray({
    message: 'The slug array of chef order item slugs must be an array',
  })
  @ArrayNotEmpty({
    message: 'The slug array of chef order item slugs must not be empty',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  chefOrderItems: string[];
}
