import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsIn,
  IsInt,
} from 'class-validator';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import { AccumulatedPointTransactionType } from './accumulated-point.constants';

export class AccumulatedPointResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty({
    description: 'Total points',
    example: 1200,
  })
  totalPoints: number;
}

export class ApplyPointsRequestDto {
  @ApiProperty({
    description: 'Points to use',
    example: 200,
  })
  @IsNotEmpty({ message: 'Points to use cannot be empty' })
  @IsNumber({}, { message: 'Points must be a number' })
  @IsInt({ message: 'Points must be a integer' })
  @Min(1, { message: 'Points must be greater than 0' })
  pointsToUse: number;
}

export class ApplyPointsResponseDto {
  @ApiProperty({
    description: 'Points used',
    example: 200,
  })
  pointsUsed: number;

  @ApiProperty({
    description: 'Final amount after applying points',
    example: 800,
  })
  finalAmount: number;
}

export class PointTransactionHistoryResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty({
    description: 'Transaction type',
    enum: AccumulatedPointTransactionType,
    example: AccumulatedPointTransactionType.ADD,
  })
  type: AccumulatedPointTransactionType;

  @AutoMap()
  @ApiProperty({
    description: 'Points changed',
    example: 100,
  })
  points: number;

  @AutoMap()
  @ApiProperty({
    description: 'Total points after transaction',
    example: 1200,
  })
  lastPoints: number;

  @AutoMap()
  @ApiProperty({
    description: 'Order slug related (if any)',
    example: 'order-slug-123',
    required: false,
  })
  orderSlug?: string;

  @AutoMap()
  @ApiProperty({
    description: 'Transaction date',
    example: '2025-08-01',
  })
  date: Date;
}

export class GetPointHistoryQueryDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    description: 'Transaction type array include (add, use, reserve, refund)',
    example: ['add', 'use', 'reserve', 'refund'],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value]; // or split it into multiple parts
    }
    return value;
  })
  @IsArray()
  @IsNotEmpty({ message: 'Types cannot be empty' })
  @IsIn(Object.values(AccumulatedPointTransactionType), { each: true })
  types: string[];

  @ApiProperty({
    description: 'Start date to filter history (ISO datetime string)',
    example: '2025-08-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  fromDate?: Date;

  @ApiProperty({
    description: 'End date to filter history (ISO datetime string)',
    example: '2025-08-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  toDate?: Date;

  @AutoMap()
  @ApiProperty({
    description: 'Return paging status',
    required: false,
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}

export interface IAddPointsDto {
  userId: string;
  orderId: string;
  points: number;
  orderTotal: number;
}
