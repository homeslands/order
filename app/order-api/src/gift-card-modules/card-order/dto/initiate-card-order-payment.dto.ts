import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { INVALID_CARD_ORDER_SLUG } from '../card-order.validation';

export class InitiateCardOrderPaymentDto {
  @IsNotEmpty({ message: INVALID_CARD_ORDER_SLUG })
  @ApiProperty()
  cardorderSlug: string;
}
