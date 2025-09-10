import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';
import { GiftCardResponseDto } from 'src/gift-card-modules/gift-card/dto/gift-card-response.dto';
import { RecipientResponseDto } from 'src/gift-card-modules/receipient/dto/recipient-response.dto';
import { PaymentResponseDto } from 'src/payment/payment.dto';
export class CardOrderResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  type: string;

  @AutoMap()
  @ApiProperty()
  status: string;

  @AutoMap()
  @ApiProperty()
  totalAmount: number;

  @AutoMap()
  @ApiProperty()
  orderDate: string;

  @AutoMap()
  @ApiProperty()
  quantity: number;

  @AutoMap()
  @ApiProperty()
  cardId: string;

  @ApiProperty()
  @AutoMap()
  cardSlug: string;

  @AutoMap()
  @ApiProperty()
  cardTitle: string;

  @AutoMap()
  @ApiProperty()
  cardPoint: number;

  @AutoMap()
  @ApiProperty()
  cardImage: string;

  @AutoMap()
  @ApiProperty()
  cardPrice: number;

  @AutoMap()
  @ApiProperty()
  customerSlug: string;

  @AutoMap()
  @ApiProperty()
  customerName: string;

  @AutoMap()
  @ApiProperty()
  customerPhone: string;

  @AutoMap()
  @ApiProperty()
  cashierSlug: string;

  @AutoMap()
  @ApiProperty()
  cashierName: string;

  @AutoMap()
  @ApiProperty()
  cashierPhone: string;

  @AutoMap(() => RecipientResponseDto)
  @ApiProperty({ type: () => [RecipientResponseDto] })
  receipients: RecipientResponseDto[];

  @AutoMap(() => GiftCardResponseDto)
  @ApiProperty({ type: () => [GiftCardResponseDto] })
  giftCards: GiftCardResponseDto[];

  @AutoMap()
  @ApiProperty()
  paymentSlug: string;

  @AutoMap()
  @ApiProperty()
  paymentStatus: string;

  @AutoMap()
  @ApiProperty()
  paymentMethod: string;

  @ApiProperty({ type: () => PaymentResponseDto })
  @AutoMap(() => PaymentResponseDto)
  payment: PaymentResponseDto;

  @AutoMap()
  @ApiProperty()
  cancelBySlug: string;

  @AutoMap()
  @ApiProperty()
  cancelAt: string;

  @AutoMap()
  @ApiProperty()
  cancelByName: string;
}
