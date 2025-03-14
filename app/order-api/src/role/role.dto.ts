import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { PermissionResponseDto } from 'src/permission/permission.dto';

export class CreateRoleDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty()
  description: string;
}

export class UpdateRoleDto extends CreateRoleDto {}

export class RoleResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  description: string;

  @AutoMap(() => PermissionResponseDto)
  permissions: PermissionResponseDto[];
}
