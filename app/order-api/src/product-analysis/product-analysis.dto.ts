import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { BranchResponseDto } from 'src/branch/branch.dto';
import { ProductResponseDto } from 'src/product/product.dto';
import { ProductAnalysisTypeQuery } from './product-analysis.constants';

export class ProductAnalysisQueryDto {
  @AutoMap()
  @Type(() => String)
  branchId: string;

  @AutoMap()
  @Type(() => Date)
  orderDate: Date;

  @AutoMap()
  @Type(() => String)
  productId: string;

  @AutoMap()
  @Type(() => Number)
  totalProducts: number;
}

export class ProductAnalysisQueryByBranchAndHourDto {
  @AutoMap()
  @Type(() => String)
  productId: string;

  @AutoMap()
  @Type(() => Number)
  totalProducts: number;
}

export class GetProductAnalysisQueryDto {
  @AutoMap()
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @AutoMap()
  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  size: number = 10;

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

  @AutoMap()
  @ApiProperty({
    description: 'Start date',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @AutoMap()
  @ApiProperty({
    description: 'End date',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @AutoMap()
  @ApiProperty({ required: false, example: 'day' })
  @IsOptional()
  @IsEnum(ProductAnalysisTypeQuery, {
    message: 'Invalid type of branch revenue query',
  })
  type: string = 'day';
}

export class ProductAnalysisResponseDto {
  @AutoMap()
  totalQuantity: number;

  @AutoMap()
  orderDate: Date;

  @AutoMap(() => BranchResponseDto)
  branch: BranchResponseDto;

  @AutoMap(() => BranchResponseDto)
  branches: BranchResponseDto[];

  @AutoMap(() => ProductResponseDto)
  product: ProductResponseDto;
}

export class RefreshSpecificRangeProductAnalysisQueryDto {
  @AutoMap()
  @ApiProperty({ required: true, example: '2024-12-26' })
  @IsNotEmpty({
    message: 'Start date is not empty',
  })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({ required: true, example: '2024-12-27' })
  @IsNotEmpty({
    message: 'End date is not empty',
  })
  @Type(() => Date)
  endDate: Date;
}
