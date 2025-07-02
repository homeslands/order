import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';
import { UserResponseDto } from 'src/user/user.dto';

export class BalanceResponseDto extends BaseResponseDto {
  @ApiProperty()
  @AutoMap()
  points: number;

  @ApiProperty({ type: () => UserResponseDto })
  @AutoMap(() => UserResponseDto)
  user: UserResponseDto;
}
