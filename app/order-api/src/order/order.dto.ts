import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { OrderType } from './order.constants';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import { BranchResponseDto } from 'src/branch/branch.dto';
import {
  CreateOrderItemRequestDto,
  OrderItemResponseDto,
} from 'src/order-item/order-item.dto';
import { Transform, Type } from 'class-transformer';
import { InvoiceResponseDto } from 'src/invoice/invoice.dto';
import {
  INVALID_ORDER_ITEMS,
  INVALID_TABLE_SLUG,
  INVALID_VOUCHER_SLUG,
  ORDER_TYPE_INVALID,
} from './order.validation';
import { INVALID_BRANCH_SLUG } from 'src/branch/branch.validation';
import { VoucherResponseDto } from 'src/voucher/voucher.dto';
import { ChefOrderResponseDto } from 'src/chef-order/chef-order.dto';

export class CreateOrderRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The type of order', example: 'take-out' })
  @IsNotEmpty({ message: ORDER_TYPE_INVALID })
  @IsEnum(OrderType, { message: ORDER_TYPE_INVALID })
  type: string;

  @AutoMap()
  @ApiProperty({ description: 'The slug of table' })
  @IsOptional()
  table: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: '',
  })
  @IsNotEmpty({ message: INVALID_BRANCH_SLUG })
  branch: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of user that creating order',
    example: '',
  })
  @IsOptional()
  owner?: string;

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

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  approvalBy?: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  voucher?: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  description?: string;
}

export class UpdateOrderRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The type of order', example: 'take-out' })
  @IsNotEmpty({ message: ORDER_TYPE_INVALID })
  @IsEnum(OrderType, { message: ORDER_TYPE_INVALID })
  type: string;

  @AutoMap()
  @ApiProperty({ description: 'The slug of table' })
  @IsOptional({ message: INVALID_TABLE_SLUG })
  table?: string;

  @AutoMap()
  @ApiProperty({ description: 'The slug of voucher' })
  @IsOptional()
  voucher?: string;

  @AutoMap()
  @ApiProperty({ description: 'The description of order' })
  @IsOptional()
  description?: string;
}

export class OwnerResponseDto extends BaseResponseDto {
  @AutoMap()
  phonenumber: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;
}

export class ApprovalUserResponseDto extends OwnerResponseDto {
  @AutoMap(() => BranchResponseDto)
  branch: BranchResponseDto;
}

export class OrderPaymentResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  paymentMethod: string;

  @AutoMap()
  @ApiProperty()
  message: string;

  @AutoMap()
  @ApiProperty()
  transactionId: string;

  @AutoMap()
  statusCode: string;

  @AutoMap()
  statusMessage: string;
}

export class OrderTableResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  location: string;

  @AutoMap()
  @ApiProperty()
  status: string;
}

export class OrderResponseDto extends BaseResponseDto {
  @AutoMap()
  referenceNumber: number;

  @AutoMap()
  subtotal: number;

  @AutoMap()
  status: string;

  @AutoMap()
  description: string;

  @AutoMap()
  type: string;

  @AutoMap()
  tableName: string;

  @AutoMap(() => OwnerResponseDto)
  owner: OwnerResponseDto;

  @AutoMap(() => ApprovalUserResponseDto)
  approvalBy: ApprovalUserResponseDto;

  @AutoMap(() => [OrderItemResponseDto])
  orderItems: OrderItemResponseDto[];

  @AutoMap(() => OrderPaymentResponseDto)
  payment: OrderPaymentResponseDto;

  @AutoMap(() => InvoiceResponseDto)
  invoice: InvoiceResponseDto;

  @AutoMap(() => OrderTableResponseDto)
  table: OrderTableResponseDto;

  @AutoMap(() => VoucherResponseDto)
  voucher: VoucherResponseDto;

  @AutoMap(() => [ChefOrderResponseDto])
  chefOrders: ChefOrderResponseDto[];
}

export class GetOrderRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: '',
    required: false,
  })
  @IsOptional()
  branch?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of table',
    example: '',
    required: false,
  })
  @IsOptional()
  table?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of owner',
    example: '',
    required: false,
  })
  @IsOptional()
  owner?: string;

  @AutoMap()
  @ApiProperty({
    description: 'Order status',
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

  @AutoMap()
  @ApiProperty({ required: false, example: '2024-12-26' })
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @AutoMap()
  @ApiProperty({ required: false, example: '2024-12-27' })
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}
