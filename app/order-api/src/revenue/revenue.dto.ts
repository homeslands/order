import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { RevenueTypeQuery } from './revenue.constant';
import { RevenueValidation } from './revenue.validation';

export class RevenueQueryResponseDto {
  @AutoMap()
  branchId: string;

  @AutoMap()
  date: Date;

  @AutoMap()
  totalAmount: string;

  @AutoMap()
  totalOrder: string;
}

export class GetRevenueQueryDto {
  @AutoMap()
  @ApiProperty({ required: false, example: '2024-12-26' })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({ required: false, example: '2024-12-27' })
  @Type(() => Date)
  endDate: Date;

  @AutoMap()
  @ApiProperty({ required: false, example: 'day' })
  // @IsNotEmpty({ message: 'Invalid type of revenue query' })
  @IsOptional()
  @IsEnum(RevenueTypeQuery, { message: 'Invalid type of revenue query' })
  type: string = 'day';
}

export class RevenueResponseDto extends BaseResponseDto {
  @ApiProperty()
  @AutoMap()
  branchId: string;

  @AutoMap()
  @ApiProperty()
  date: Date;

  @AutoMap()
  @ApiProperty()
  totalAmount: number;

  @AutoMap()
  @ApiProperty()
  totalOrder: number;
}

export class AggregateRevenueResponseDto {
  @AutoMap()
  @ApiProperty()
  date: Date;

  @AutoMap()
  @ApiProperty()
  totalAmount: number;

  @AutoMap()
  @ApiProperty()
  totalOrder: number;
}

export class AggregateRevenueResponseDtoFromBranchRevenue {
  @AutoMap()
  @ApiProperty()
  date: Date;

  @AutoMap()
  @ApiProperty()
  totalAmount: number;

  @AutoMap()
  @ApiProperty()
  totalAmountBank: number;

  @AutoMap()
  @ApiProperty()
  totalAmountCash: number;

  @AutoMap()
  @ApiProperty()
  totalAmountInternal: number;

  @AutoMap()
  @ApiProperty()
  totalOrder: number;

  @AutoMap()
  @ApiProperty()
  originalAmount: number;

  @AutoMap()
  @ApiProperty()
  voucherAmount: number;

  @AutoMap()
  @ApiProperty()
  promotionAmount: number;
}

export class RefreshSpecificRangeRevenueQueryDto {
  @AutoMap()
  @ApiProperty({ required: true, example: '2024-12-26' })
  @IsNotEmpty({ message: RevenueValidation.START_DATE_IS_NOT_EMPTY.message })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({ required: true, example: '2024-12-27' })
  @IsNotEmpty({ message: RevenueValidation.END_DATE_IS_NOT_EMPTY.message })
  @Type(() => Date)
  endDate: Date;
}
