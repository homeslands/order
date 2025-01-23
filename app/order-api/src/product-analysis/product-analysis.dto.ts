import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';
import { BranchResponseDto } from 'src/branch/branch.dto';
import { ProductResponseDto } from 'src/product/product.dto';

export class ProductAnalysisQueryDto {
  @AutoMap()
  branchId: string;

  @AutoMap()
  orderDate: Date;

  @AutoMap()
  productId: string;

  @AutoMap()
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
