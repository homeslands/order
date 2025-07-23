import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { BaseResponseDto, BaseQueryDto } from 'src/app/base.dto';
import { BranchResponseDto } from 'src/branch/branch.dto';
import { PromotionType } from './promotion.constant';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class CreatePromotionRequestDto {
  @AutoMap()
  @ApiProperty({ 
    description: 'The title of promotion', 
    example: 'Summer Sale Promotion',
    required: true
  })
  @IsNotEmpty({ message: 'The title of promotion is required' })
  title: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of promotion (optional)',
    example: 'Get 20% off on all summer products',
    required: false,
  })
  @IsOptional()
  description?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The start date of promotion (YYYY-MM-DD format)',
    example: '2024-06-01',
    required: true,
  })
  @IsNotEmpty({ message: 'The start date of promotion is required' })
  @IsDate({ message: 'The start date of promotion must be a date' })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({
    description: 'The end date of promotion (YYYY-MM-DD format)',
    example: '2024-08-31',
    required: true,
  })
  @IsNotEmpty({ message: 'The end date of promotion is required' })
  @IsDate({ message: 'The end date of promotion must be a date' })
  @Type(() => Date)
  endDate: Date;

  @AutoMap()
  @ApiProperty({ 
    description: 'The type of promotion', 
    example: 'per-product',
    enum: ['per-product', 'co-price'],
    required: true
  })
  @IsNotEmpty({ message: 'The type of promotion is required' })
  @IsEnum(PromotionType, {
    message: 'Promotion type must be co-price or per-product',
  })
  type: string;

  @AutoMap()
  @ApiProperty({ 
    description: 'The value of promotion (0-100)', 
    example: 20,
    minimum: 0,
    maximum: 100,
    required: true
  })
  @IsNotEmpty({ message: 'The value of promotion is required' })
  @Min(0, {
    message: 'The value of promotion must be greater than or equal to 0',
  })
  @Max(100, {
    message: 'The value of promotion must be less than or equal to 100',
  })
  value: number;
}

export class UpdatePromotionRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch for the promotion',
    example: 'branch-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of branch is required' })
  branch: string;

  @AutoMap()
  @ApiProperty({ 
    description: 'The title of promotion', 
    example: 'Updated Summer Sale Promotion',
    required: true
  })
  @IsNotEmpty({ message: 'The title of promotion is required' })
  title: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of promotion (optional)',
    example: 'Updated description for summer promotion',
    required: false,
  })
  @IsOptional()
  description?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The start date of promotion (YYYY-MM-DD format)',
    example: '2024-06-01',
    required: true,
  })
  @IsNotEmpty({ message: 'The start date of promotion is required' })
  @IsDate({ message: 'The start date of promotion must be a date' })
  @Type(() => Date)
  startDate: Date;

  @AutoMap()
  @ApiProperty({
    description: 'The end date of promotion (YYYY-MM-DD format)',
    example: '2024-09-30',
    required: true,
  })
  @IsNotEmpty({ message: 'The end date of promotion is required' })
  @IsDate({ message: 'The end date of promotion must be a date' })
  @Type(() => Date)
  endDate: Date;

  @AutoMap()
  @ApiProperty({ 
    description: 'The type of promotion', 
    example: 'per-product',
    enum: ['per-product', 'co-price'],
    required: true
  })
  @IsNotEmpty({ message: 'The type of promotion is required' })
  @IsEnum(PromotionType, {
    message: 'Promotion type must be co-price or per-product',
  })
  type: string;

  @AutoMap()
  @ApiProperty({ 
    description: 'The value of promotion (0-100)', 
    example: 25,
    minimum: 0,
    maximum: 100,
    required: true
  })
  @IsNotEmpty({ message: 'The value of promotion is required' })
  @Min(0, {
    message: 'The value of promotion must be greater than or equal to 0',
  })
  @Max(100, {
    message: 'The value of promotion must be less than or equal to 100',
  })
  value: number;
}

export class GetAllPromotionRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch to get promotions for',
    example: 'branch-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of branch is required' })
  branchSlug: string;

  @AutoMap()
  @ApiProperty({
    description: 'Filter by promotion type',
    example: 'per-product',
    enum: ['per-product', 'co-price'],
    required: false,
  })
  @IsOptional()
  @IsEnum(PromotionType, {
    message: 'Promotion type must be co-price or per-product',
  })
  type?: string;

  @AutoMap()
  @ApiProperty({
    description: 'Enable/disable pagination (default: true)',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}

export class PromotionResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty({
    description: 'The title of promotion',
    example: 'Summer Sale Promotion',
  })
  title: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of promotion',
    example: 'Get 20% off on all summer products',
    required: false,
  })
  description?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The start date of promotion',
    example: '2024-06-01T00:00:00.000Z',
  })
  startDate: string;

  @AutoMap()
  @ApiProperty({
    description: 'The end date of promotion',
    example: '2024-08-31T00:00:00.000Z',
  })
  endDate: string;

  @AutoMap()
  @ApiProperty({
    description: 'The type of promotion',
    example: 'per-product',
    enum: ['per-product', 'co-price'],
  })
  type: string;

  @AutoMap()
  @ApiProperty({
    description: 'The value of promotion',
    example: 20,
  })
  value: number;

  @AutoMap(() => BranchResponseDto)
  @ApiProperty({
    description: 'The branch information',
    type: () => BranchResponseDto,
  })
  branch: BranchResponseDto;
}
