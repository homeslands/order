import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';
import { PaymentMethod } from './payment.constants';
import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { CREDIT_CARD_TRANSACTION_ID_REQUIRED } from './payment.validation';
import { INVALID_ORDER_SLUG } from 'src/order/order.validation';

export class CreatePaymentDto {
  @AutoMap()
  @ApiProperty()
  @ApiProperty({
    example: 'bank-transfer',
    description: 'Payment method',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({
    message: INVALID_ORDER_SLUG,
  })
  orderSlug: string;

  @AutoMap()
  @ApiProperty()
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.CREDIT_CARD)
  @IsNotEmpty({
    message: CREDIT_CARD_TRANSACTION_ID_REQUIRED,
  })
  transactionId?: string;
}

export class GetSpecificPaymentRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'Request trace' })
  transaction: string;
}

export class PaymentResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  paymentMethod: string;

  @AutoMap()
  @ApiProperty()
  amount: number;

  @AutoMap()
  @ApiProperty()
  loss: number;

  @AutoMap()
  @ApiProperty()
  message: string;

  @AutoMap()
  @ApiProperty()
  transactionId: string;

  @AutoMap()
  @ApiProperty()
  qrCode: string;

  @AutoMap()
  @ApiProperty()
  userId: string;

  @AutoMap()
  @ApiProperty()
  statusCode: string;

  @AutoMap()
  @ApiProperty()
  statusMessage: string;
}
