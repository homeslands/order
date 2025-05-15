import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import {
  RevenueTypeExport,
  RevenueTypeQuery,
} from 'src/revenue/revenue.constant';
import { BranchRevenueValidation } from './branch-revenue.validation';

export class BranchRevenueQueryResponseDto {
  @AutoMap()
  branchId: string;

  @AutoMap()
  date: Date;

  @AutoMap()
  totalAmount: string;

  @AutoMap()
  totalAmountBank: string;

  @AutoMap()
  totalAmountCash: string;

  @AutoMap()
  totalAmountInternal: string;

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

  @AutoMap()
  totalOrderCash: string;

  @AutoMap()
  totalOrderBank: string;

  @AutoMap()
  totalOrderInternal: string;
}

export class BranchRevenueQueryResponseForHourDto extends BranchRevenueQueryResponseDto {}

export class GetBranchRevenueQueryDto {
  @AutoMap()
  @ApiProperty({
    required: false,
    example: '2024-12-26',
    description:
      'If type is hour, please provide date with format YYYY-MM-DD HH:mm:ss',
  })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({
    required: false,
    example: '2024-12-27',
    description:
      'If type is hour, please provide date with format YYYY-MM-DD HH:mm:ss',
  })
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
  minReferenceNumberOrder: number;

  @AutoMap()
  @ApiProperty()
  maxReferenceNumberOrder: number;

  @AutoMap()
  @ApiProperty()
  totalOrderCash: number;

  @AutoMap()
  @ApiProperty()
  totalOrderBank: number;

  @AutoMap()
  @ApiProperty()
  totalOrderInternal: number;

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
export class ExportBranchRevenueQueryDto {
  @AutoMap()
  @ApiProperty({
    required: true,
    example: 'branch-slug',
  })
  @IsNotEmpty({
    message: BranchRevenueValidation.BRANCH_SLUG_IS_NOT_EMPTY.message,
  })
  @Type(() => String)
  branch: string;

  @AutoMap()
  @ApiProperty({
    required: true,
    example: '2025-04-05',
    description:
      'If type is hour, please provide date with format YYYY-MM-DD HH:mm:ss',
  })
  @IsNotEmpty({
    message: BranchRevenueValidation.START_DATE_IS_NOT_EMPTY.message,
  })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({
    required: true,
    example: '2025-04-06',
    description:
      'If type is hour, please provide date with format YYYY-MM-DD HH:mm:ss',
  })
  @IsNotEmpty({
    message: BranchRevenueValidation.END_DATE_IS_NOT_EMPTY.message,
  })
  @Type(() => Date)
  endDate: Date;

  @AutoMap()
  @ApiProperty({ required: false, example: 'day' })
  @IsOptional()
  @IsEnum(RevenueTypeExport, {
    message: 'Invalid type of branch revenue query',
  })
  type: string = 'day';
}

export class ExportHandOverTicketRequestDto {
  @AutoMap()
  @ApiProperty({
    required: true,
    example: 'branch-slug',
  })
  @IsNotEmpty({
    message: BranchRevenueValidation.BRANCH_SLUG_IS_NOT_EMPTY.message,
  })
  @Type(() => String)
  branch: string;

  @AutoMap()
  @ApiProperty({
    required: true,
    example: '2025-04-06 08:00:00',
    description: 'Please provide date with format YYYY-MM-DD HH:mm:ss',
  })
  @IsNotEmpty({
    message: BranchRevenueValidation.START_DATE_IS_NOT_EMPTY.message,
  })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({
    required: true,
    example: '2025-04-06 15:30:00',
    description: 'Please provide date with format YYYY-MM-DD HH:mm:ss',
  })
  @IsNotEmpty({
    message: BranchRevenueValidation.END_DATE_IS_NOT_EMPTY.message,
  })
  @Type(() => Date)
  endDate: Date;
}
