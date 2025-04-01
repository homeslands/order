import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { RevenueTypeQuery } from 'src/revenue/revenue.constant';
import { BranchRevenueValidation } from './branch-revenue.validation';

export class BranchRevenueQueryResponseDto {
  @AutoMap()
  branchId: string;

  @AutoMap()
  date: Date;

  @AutoMap()
  totalAmount: string;

  @AutoMap()
  totalFinalAmountOrder: string;

  @AutoMap()
  totalOriginalAmountOrder: string;

  @AutoMap()
  totalOriginalOrderItemAmount: string;

  @AutoMap()
  totalFinalOrderItemAmount: string;

  @AutoMap()
  totalOrder: string;
}

export class GetBranchRevenueQueryDto {
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
  @IsOptional()
  @IsEnum(RevenueTypeQuery, { message: 'Invalid type of branch revenue query' })
  type: string = 'day';
}

export class BranchRevenueResponseDto extends BaseResponseDto {
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

export class AggregateBranchRevenueResponseDto {
  @AutoMap()
  @ApiProperty()
  date: Date;

  @AutoMap()
  @ApiProperty()
  totalAmount: number;

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

export class RefreshSpecificRangeBranchRevenueQueryDto {
  @AutoMap()
  @ApiProperty({ required: true, example: '2024-12-26' })
  @IsNotEmpty({
    message: BranchRevenueValidation.START_DATE_IS_NOT_EMPTY.message,
  })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({ required: true, example: '2024-12-27' })
  @IsNotEmpty({
    message: BranchRevenueValidation.END_DATE_IS_NOT_EMPTY.message,
  })
  @Type(() => Date)
  endDate: Date;
}
