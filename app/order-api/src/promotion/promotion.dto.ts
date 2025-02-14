import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, Max, Min } from "class-validator";
import { BaseResponseDto } from "src/app/base.dto";
import { BranchResponseDto } from "src/branch/branch.dto";
import { PromotionType } from "./promotion.constant";
import { Transform, Type } from "class-transformer";

export class CreatePromotionRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The title of promotion', example: 'Khuyến mãi' })
  @IsNotEmpty({ message: 'The title of promotion is required' })
  title: string;

  @AutoMap()
  @ApiProperty({ description: 'The description of promotion', example: 'Mô tả' })
  @IsOptional()
  description?: string;

  @AutoMap()
  @ApiProperty({ description: 'The start date of promotion', example: '2025-02-10' })
  @IsNotEmpty({ message: 'The start date of promotion is required' })
  @IsDate({ message: 'The start date of promotion must be a date' })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({ description: 'The end date of promotion', example: '2025-02-20' })
  @IsNotEmpty({ message: 'The end date of promotion is required' })
  @IsDate({ message: 'The end date of promotion must be a date' })
  @Type(() => Date)
  endDate: Date;

  @AutoMap()
  @ApiProperty({ description: 'The type of promotion', example: 'per-product' })
  @IsNotEmpty({ message: 'The type of promotion is required' })
  @IsEnum(PromotionType, { message: 'Promotion type must be co-price or per-product' })
  type: string;

  @AutoMap()
  @ApiProperty({ description: 'The value of promotion', example: 10 })
  @IsNotEmpty({ message: 'The value of promotion is required' })
  @Min(0, { message: 'The value of promotion must be greater than or equal to 0'})
  @Max(100, { message: 'The value of promotion must be less than or equal to 100'})
  value: number;
}

export class UpdatePromotionRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The slug of branch updated for promotion', example: 'branch-slug' })
  @IsNotEmpty({ message: 'The slug of branch is required' })
  branch: string;

  @AutoMap()
  @ApiProperty({ description: 'The title of promotion', example: 'Khuyến mãi' })
  @IsNotEmpty({ message: 'The title of promotion is required' })
  title: string;

  @AutoMap()
  @ApiProperty({ description: 'The description of promotion', example: 'Mô tả' })
  @IsOptional()
  description?: string;

  @AutoMap()
  @ApiProperty({ description: 'The start date of promotion', example: '2021-10-10' })
  @IsNotEmpty({ message: 'The start date of promotion is required' })
  @IsDate({ message: 'The start date of promotion must be a date' })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({ description: 'The end date of promotion', example: '2021-10-20' })
  @IsNotEmpty({ message: 'The end date of promotion is required' })
  @IsDate({ message: 'The end date of promotion must be a date' })
  @Type(() => Date)
  endDate: Date;

  @AutoMap()
  @ApiProperty({ description: 'The type of promotion', example: 'per-product' })
  @IsNotEmpty({ message: 'The type of promotion is required' })
  @IsEnum(PromotionType, { message: 'Promotion type must be co-price or per-product' })
  type: string;

  @AutoMap()
  @ApiProperty({ description: 'The value of promotion', example: 10 })
  @IsNotEmpty({ message: 'The value of promotion is required' })
  @Min(0, { message: 'The value of promotion must be greater than or equal to 0'})
  @Max(100, { message: 'The value of promotion must be less than or equal to 100'})
  value: number;
}

export class PromotionResponseDto extends BaseResponseDto {
  @AutoMap()
  title: string;

  @AutoMap()
  description?: string;

  @AutoMap()
  startDate: string;

  @AutoMap()
  endDate: string;

  @AutoMap()
  type: string;

  @AutoMap()
  value: number;

  @AutoMap(() => BranchResponseDto)
  branch: BranchResponseDto;
}