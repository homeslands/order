import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';
import { GiftCardResponseDto } from 'src/gift-card-modules/gift-card/dto/gift-card-response.dto';
import { RecipientResponseDto } from 'src/gift-card-modules/receipient/dto/recipient-response.dto';
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
  customerId: string;

  @AutoMap()
  @ApiProperty()
  customerName: string;

  @AutoMap()
  @ApiProperty()
  customerPhone: string;

  @AutoMap()
  @ApiProperty()
  cashierId: string;

  @AutoMap()
  @ApiProperty()
  cashierName: string;

  @AutoMap()
  @ApiProperty()
  cashierPhone: string;

  @AutoMap(() => RecipientResponseDto)
  @ApiProperty()
  receipients: RecipientResponseDto[];

  @AutoMap(() => GiftCardResponseDto)
  @ApiProperty()
  giftCards: GiftCardResponseDto[];

  @AutoMap()
  @ApiProperty()
  paymentStatus: string;

  @AutoMap()
  @ApiProperty()
  paymentMethod: string;
}
