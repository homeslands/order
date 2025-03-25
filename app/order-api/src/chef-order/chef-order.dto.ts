import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ChefOrderItemResponseDto } from 'src/chef-order-item/chef-order-item.dto';
import { OrderResponseDto } from 'src/order/order.dto';
import { ChefOrderStatus } from './chef-order.constants';

export class ChefOrderResponseDto extends BaseResponseDto {
  @AutoMap()
  status: string;

  @AutoMap(() => ChefAreaResponseDto)
  chefArea: ChefAreaResponseDto;

  @AutoMap(() => OrderResponseDto)
  order: OrderResponseDto;

  @AutoMap(() => [ChefOrderItemResponseDto])
  chefOrderItems: ChefOrderItemResponseDto[];
}

export class QueryGetChefOrderGroupByChefAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: 'branch-slug',
    required: false,
  })
  @IsOptional()
  branch?: string;

  @AutoMap()
  @ApiProperty({
    description:
      'The slug of chef area,  if query have both branch and chef area, it get by chef area',
    example: 'chef-area-slug',
    required: false,
  })
  @IsOptional()
  chefArea?: string;

  @AutoMap()
  @ApiProperty({
    description:
      'The slug of chef area,  if query have both branch and chef area, it get by chef area',
    example: 'accepted',
    required: false,
  })
  @IsOptional()
  @IsEnum(ChefOrderStatus, {
    message: 'Status must be pending or accepted or rejected or completed',
  })
  status?: string;
}

export class QueryGetAllChefOrderRequestDto {
  @AutoMap()
  @ApiProperty({
    description:
      'The slug of chef area,  if query have both branch and chef area, it get by chef area',
    example: 'chef-area-slug',
    required: false,
  })
  @IsOptional()
  chefArea?: string;

  @AutoMap()
  @ApiProperty({
    description:
      'The slug of chef area,  if query have both branch and chef area, it get by chef area',
    example: 'accepted',
    required: false,
  })
  @IsOptional()
  @IsEnum(ChefOrderStatus, {
    message: 'Status must be pending or accepted or rejected or completed',
  })
  status?: string;
}

export class UpdateChefOrderRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The status of chef order is updated',
    example: 'accepted',
    required: false,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ChefOrderStatus, {
    message: 'Status must be pending or accepted or rejected or completed',
  })
  status?: string;
}
