import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { AuthorityResponseDto } from 'src/authority/authority.dto';

export class CreatePermissionDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty()
  role: string;

  @AutoMap()
  @ApiProperty()
  @IsArray()
  authorities: string[];
}

export class DeletePermissionDto {}

export class PermissionResponseDto extends BaseResponseDto {
  // @AutoMap()
  // @ApiProperty()
  // role: RoleResponseDto;

  @AutoMap()
  @ApiProperty()
  authority: AuthorityResponseDto;
}
