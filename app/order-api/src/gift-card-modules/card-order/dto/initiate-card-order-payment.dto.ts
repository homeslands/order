import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  INVALID_CARD_ORDER_SLUG,
  INVALID_PAYMENT_METHOD,
} from '../card-order.validation';

export class InitiateCardOrderPaymentDto {
  @IsNotEmpty({ message: INVALID_CARD_ORDER_SLUG })
  @ApiProperty()
  cardorderSlug: string;
}

export class InitiateCardOrderPaymentAdminDto extends InitiateCardOrderPaymentDto {
  @IsNotEmpty({ message: INVALID_PAYMENT_METHOD })
  @ApiProperty()
  paymentMethod: string;
}
