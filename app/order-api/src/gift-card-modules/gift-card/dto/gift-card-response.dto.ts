import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';
import { AutoMap } from '@automapper/classes';
import { CardOrderResponseDto } from 'src/gift-card-modules/card-order/dto/card-order-response.dto';
import { UserResponseDto } from 'src/user/user.dto';

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

  @AutoMap(() => UserResponseDto)
  @ApiProperty()
  usedBy: UserResponseDto;

  @AutoMap(() => CardOrderResponseDto)
  @ApiProperty({ type: () => CardOrderResponseDto })
  cardOrder: CardOrderResponseDto;

  @AutoMap()
  @ApiProperty()
  expiredAt: string;

  @AutoMap()
  @ApiProperty()
  code: string;

  @AutoMap()
  @ApiProperty()
  serial: string;

  @ApiProperty()
  @AutoMap()
  usedBySlug: string;
}
