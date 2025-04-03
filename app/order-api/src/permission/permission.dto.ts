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
  createAuthorities: string[];

  @AutoMap()
  @ApiProperty()
  @IsArray()
  deleteAuthorities: string[];
}

export class DeletePermissionDto {}

export class PermissionResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  authority: AuthorityResponseDto;
}
