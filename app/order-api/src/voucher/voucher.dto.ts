import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import {
  INVALID_VOUCHER_SLUGS,
  IsEndDateAfterStartDate,
} from './voucher.validation';
import { VoucherApplicabilityRule, VoucherType } from './voucher.constant';
import { CreateOrderItemRequestDto } from 'src/order-item/order-item.dto';
import { INVALID_ORDER_ITEMS } from 'src/order/order.validation';
import { VoucherProductResponseDto } from 'src/voucher-product/voucher-product.dto';

export class CreateVoucherDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_GROUP' })
  @AutoMap()
  voucherGroup: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_APPLICABILITY_RULE' })
  @IsEnum(VoucherApplicabilityRule, {
    message:
      'Voucher applicability rule must be all_required or at_least_one_required',
  })
  @AutoMap()
  applicabilityRule: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_TITLE' })
  @AutoMap()
  title: string;

  @ApiProperty()
  @AutoMap()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_CODE' })
  code: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_VALUE' })
  @Min(0)
  value: number;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_MAX_USAGE' })
  @Min(1)
  maxUsage: number;

  @ApiProperty()
  @AutoMap()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2024-12-26' })
  @AutoMap()
  @IsDate({ message: 'The start date of voucher must be a date' })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2024-12-30' })
  @AutoMap()
  @IsDate({ message: 'The end date of voucher must be a date' })
  @Type(() => Date)
  @IsEndDateAfterStartDate()
  endDate: Date;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsNotEmpty({ message: 'INVALID_IS_VERIFICATION_IDENTITY' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isVerificationIdentity: boolean;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsNotEmpty({ message: 'INVALID_IS_PRIVATE' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isPrivate: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The status of chef order',
    required: true,
    enum: VoucherType,
  })
  @IsNotEmpty({ message: 'INVALID_VOUCHER_TYPE' })
  @IsEnum(VoucherType, {
    message:
      'Voucher type must be percent_order or fixed_value or same_price_product',
  })
  type: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_NUMBER_OF_USAGE_PER_USER' })
  @Min(1)
  numberOfUsagePerUser: number;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be created applicable promotion',
    required: true,
    example: ['product-slug'],
  })
  @IsDefined({ message: 'The slug array of the products is not defined' })
  @IsArray({
    message: 'The slug array of the applicable object must be an array',
  })
  // @ArrayNotEmpty({
  //   message: 'The slug array of the applicable object is not empty',
  // })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  products: string[];
}

export class BulkCreateVoucherDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_GROUP' })
  @AutoMap()
  voucherGroup: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_APPLICABILITY_RULE' })
  @IsEnum(VoucherApplicabilityRule, {
    message:
      'Voucher applicability rule must be all_required or at_least_one_required',
  })
  @AutoMap()
  applicabilityRule: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_NUMBER_OF_VOUCHER' })
  @Min(2)
  numberOfVoucher: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_TITLE' })
  @AutoMap()
  title: string;

  @ApiProperty()
  @AutoMap()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_VALUE' })
  @Min(0)
  value: number;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_MAX_USAGE' })
  @Min(1)
  maxUsage: number;

  @ApiProperty()
  @AutoMap()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2024-12-26' })
  @AutoMap()
  @IsDate({ message: 'The start date of voucher must be a date' })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2024-12-30' })
  @AutoMap()
  @IsDate({ message: 'The end date of voucher must be a date' })
  @Type(() => Date)
  @IsEndDateAfterStartDate()
  endDate: Date;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsNotEmpty({ message: 'INVALID_IS_VERIFICATION_IDENTITY' })
  @Transform(({ value }) => {
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isVerificationIdentity: boolean;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsNotEmpty({ message: 'INVALID_IS_PRIVATE' })
  @Transform(({ value }) => {
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isPrivate: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The status of chef order',
    required: true,
    enum: VoucherType,
  })
  @IsNotEmpty({ message: 'INVALID_VOUCHER_TYPE' })
  @IsEnum(VoucherType, {
    message:
      'Voucher type must be percent_order or fixed_value or same_price_product',
  })
  type: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_NUMBER_OF_USAGE_PER_USER' })
  @Min(1)
  numberOfUsagePerUser: number;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the products to be created voucher product',
    required: true,
    example: ['product-slug'],
  })
  @IsDefined({ message: 'The slug array of the products is not defined' })
  @IsArray({
    message: 'The slug array of the products must be an array',
  })
  // @ArrayNotEmpty({
  //   message: 'The slug array of the products is not empty',
  // })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  products: string[];
}

export class UpdateVoucherDto extends CreateVoucherDto {
  @ApiProperty()
  @AutoMap()
  @IsOptional()
  isActive?: boolean;
}

export class GetAllVoucherForUserDto extends BaseQueryDto {
  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2024-12-26', required: false })
  @AutoMap()
  @IsDate({ message: 'The date of voucher must be a date' })
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isActive?: boolean;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isVerificationIdentity?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The option has paging or not',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}
export class GetAllVoucherForUserPublicDto extends BaseQueryDto {
  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2024-12-26', required: false })
  @AutoMap()
  @IsDate({ message: 'The date of voucher must be a date' })
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isActive?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The option has paging or not',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}
export class GetAllVoucherDto extends BaseQueryDto {
  @ApiProperty({ required: true })
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_GROUP' })
  voucherGroup: string;

  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  minOrderValue?: number;

  @ApiProperty({ example: '2024-12-26', required: false })
  @AutoMap()
  @IsDate({ message: 'The date of voucher must be a date' })
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isActive?: boolean;

  @AutoMap()
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  isPrivate?: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The option has paging or not',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true' || value === true; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}

export class GetVoucherDto {
  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  slug?: string;

  @ApiProperty({ required: false })
  @AutoMap()
  @IsOptional()
  code?: string;
}

export class ValidateVoucherDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_SLUG' })
  voucher: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_USER_SLUG' })
  user: string;

  @ApiProperty({
    description: 'The array of order items',
    example: [
      {
        quantity: 2,
        variant: '',
        note: '',
        promotion: '',
        order: '',
      },
    ],
  })
  @IsArray({ message: INVALID_ORDER_ITEMS })
  @ArrayNotEmpty({ message: INVALID_ORDER_ITEMS })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemRequestDto)
  orderItems: CreateOrderItemRequestDto[];
}
export class ValidateVoucherPublicDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: 'INVALID_VOUCHER_SLUG' })
  voucher: string;

  @ApiProperty({
    description: 'The array of order items',
    example: [
      {
        quantity: 2,
        variant: '',
        note: '',
        promotion: '',
        order: '',
      },
    ],
  })
  @IsArray({ message: INVALID_ORDER_ITEMS })
  @ArrayNotEmpty({ message: INVALID_ORDER_ITEMS })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemRequestDto)
  orderItems: CreateOrderItemRequestDto[];
}

export class VoucherResponseDto extends BaseResponseDto {
  @ApiProperty()
  @AutoMap()
  title: string;

  @ApiProperty()
  @AutoMap()
  description: string;

  @ApiProperty()
  @AutoMap()
  code: string;

  @ApiProperty()
  @AutoMap()
  applicabilityRule: string;

  @ApiProperty()
  @AutoMap()
  maxUsage: number;

  @ApiProperty()
  @AutoMap()
  minOrderValue: number;

  @ApiProperty()
  @AutoMap()
  startDate: Date;

  @ApiProperty()
  @AutoMap()
  endDate: Date;

  @ApiProperty()
  @AutoMap()
  value: number;

  @ApiProperty()
  @AutoMap()
  isActive: boolean;

  @ApiProperty()
  @AutoMap()
  remainingUsage: number;

  @ApiProperty()
  @AutoMap()
  isVerificationIdentity: boolean;

  @ApiProperty()
  @AutoMap()
  isPrivate: boolean;

  @ApiProperty()
  @AutoMap()
  type: string;

  @ApiProperty()
  @AutoMap()
  numberOfUsagePerUser: number;

  @ApiProperty()
  @AutoMap()
  voucherProducts: VoucherProductResponseDto[];
}

export class ExportPdfVoucherDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty({ message: INVALID_VOUCHER_SLUGS })
  @IsArray({ message: INVALID_VOUCHER_SLUGS })
  @ArrayNotEmpty({ message: INVALID_VOUCHER_SLUGS })
  vouchers: string[];
}
