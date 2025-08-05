import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';

export class CardResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  title: string;

  @AutoMap()
  @ApiProperty()
  image: string;

  @AutoMap()
  @ApiProperty()
  description: string;

  @AutoMap()
  @ApiProperty()
  price: number;

  @AutoMap()
  @ApiProperty()
  points: number;

  @AutoMap()
  @ApiProperty()
  isActive: boolean;

  @AutoMap()
  @ApiProperty()
  version: number;
}
