import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ChefOrderItemResponseDto } from 'src/chef-order-item/chef-order-item.dto';
import { OrderResponseDto } from 'src/order/order.dto';
import { ChefOrderStatus } from './chef-order.constants';
import { Type } from 'class-transformer';

export class CreateChefOrderRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of order',
    required: true,
  })
  @IsNotEmpty()
  order: string;
}

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

export class QueryGetAllChefOrderRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    description:
      'The slug of chef area,  if query have both branch and chef area, it get by chef area',
    required: false,
  })
  @IsOptional()
  chefArea?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The status of chef order',
    required: false,
    enum: ChefOrderStatus,
  })
  @IsOptional()
  @IsEnum(ChefOrderStatus, {
    message: 'Status must be pending or accepted or rejected or completed',
  })
  status?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of order',
    required: false,
  })
  @IsOptional()
  order?: string;

  @AutoMap()
  @ApiProperty({ required: false, example: '2024-12-26' })
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @AutoMap()
  @ApiProperty({ required: false, example: '2024-12-27' })
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

export class QueryGetChefOrderGroupByChefAreaRequestDto extends QueryGetAllChefOrderRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    required: false,
  })
  @IsOptional()
  branch?: string;
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
