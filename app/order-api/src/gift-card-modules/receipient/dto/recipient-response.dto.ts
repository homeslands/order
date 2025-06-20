import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';

export class RecipientResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  quantity: number;

  @AutoMap()
  @ApiProperty()
  status: string;

  @AutoMap()
  @ApiProperty()
  message?: string;

  @AutoMap()
  @ApiProperty()
  phone: string;

  @AutoMap()
  @ApiProperty()
  recipientId: string;

  @ApiProperty()
  @AutoMap()
  recipientSlug: string;

  @AutoMap()
  @ApiProperty()
  senderId: string;

  @ApiProperty()
  @AutoMap()
  senderSlug: string;

  @AutoMap()
  @ApiProperty()
  senderName: string;

  @AutoMap()
  @ApiProperty()
  senderPhone: string;
}
