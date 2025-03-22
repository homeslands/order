import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';

export class CreateAuthorityDto {}
export class UpdateAuthorityDto {}

export class AuthorityResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  description: string;
}

export class AuthorityJSON {
  @AutoMap()
  name: string;

  @AutoMap()
  code: string;

  @AutoMap()
  description: string;
}
