import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import {
  CreateTrackingOrderItemRequestDto,
  TrackingOrderItemResponseDto,
} from 'src/tracking-order-item/tracking-order-item.dto';
import { TrackingType, WorkflowStatus } from './tracking.constants';

export class CreateTrackingRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The type of tracking', example: 'by-robot' })
  @IsNotEmpty({ message: 'Invalid type of tracking' })
  @IsEnum(TrackingType, { message: 'Invalid type of tracking' })
  type: string;

  @ApiProperty({
    description: 'The array of tracking order item',
    example: [
      {
        quantity: 2,
        orderItem: 'order-item-slug-123',
      },
    ],
  })
  @IsArray({ message: 'Invalid tracking order item list' })
  @ArrayNotEmpty({ message: 'Invalid tracking order item list' })
  @ValidateNested({ each: true })
  @Type(() => CreateTrackingOrderItemRequestDto)
  trackingOrderItems: CreateTrackingOrderItemRequestDto[];
}

export class TrackingResponseDto extends BaseResponseDto {
  @AutoMap()
  status: string;

  @AutoMap(() => [TrackingOrderItemResponseDto])
  trackingOrderItems: TrackingOrderItemResponseDto[];
}

export class ChangeStatusRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({ description: 'The status of tracking', example: 'PENDING' })
  @IsNotEmpty({ message: 'Invalid status of tracking' })
  @IsEnum(WorkflowStatus, { message: 'Invalid status of tracking' })
  status: string;
}

export class GetTrackingRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    description: 'Tracking status',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : [value],
  )
  status: string[] = [];

  @AutoMap()
  @ApiProperty({
    description: 'Enable paging',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}
