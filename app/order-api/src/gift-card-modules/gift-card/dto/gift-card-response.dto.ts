import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';
import { AutoMap } from '@automapper/classes';
import { CardOrderResponseDto } from 'src/gift-card-modules/card-order/dto/card-order-response.dto';

export class GiftCardResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  cardName: string;

  @AutoMap()
  @ApiProperty()
  cardPoints: number;

  @AutoMap()
  @ApiProperty()
  status: string;

  @AutoMap()
  @ApiProperty()
  usedAt: string;

  @AutoMap()
  @ApiProperty()
  usedBy: string;

  @AutoMap(() => CardOrderResponseDto)
  @ApiProperty({ type: () => CardOrderResponseDto })
  cardOrder: CardOrderResponseDto;
}
