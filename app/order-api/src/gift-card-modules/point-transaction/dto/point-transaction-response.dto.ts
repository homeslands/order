import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';
import { UserResponseDto } from 'src/user/user.dto';

export class PointTransactionResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  type: string;

  @AutoMap()
  @ApiProperty()
  desc: string;

  @ApiProperty()
  @AutoMap()
  objectType: string;

  @ApiProperty()
  @AutoMap()
  objectSlug: string;

  @ApiProperty()
  @AutoMap()
  points: number;

  @ApiProperty()
  @AutoMap(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty()
  @AutoMap()
  userSlug: string;
}
