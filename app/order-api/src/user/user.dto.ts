import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import {
  INVALID_FIRSTNAME,
  INVALID_LASTNAME,
  INVALID_PASSWORD,
  INVALID_PHONENUMBER,
  INVALID_USERID,
} from 'src/auth/auth.validation';
import { BranchResponseDto } from 'src/branch/branch.dto';
import { RoleResponseDto } from 'src/role/role.dto';

export class CreateUserRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_PHONENUMBER })
  @AutoMap()
  phonenumber: string;

  @ApiProperty()
  @IsNotEmpty({ message: INVALID_PASSWORD })
  password: string;

  @ApiProperty()
  @IsNotEmpty({ message: INVALID_FIRSTNAME })
  @AutoMap()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({ message: INVALID_LASTNAME })
  @AutoMap()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  branch?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Invalid role' })
  role: string;
}

export class CurrentUserDto {
  @IsNotEmpty({ message: INVALID_USERID })
  userId: string;

  @IsOptional()
  scope?: string;
}

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty()
  @AutoMap()
  readonly phonenumber: string;

  @ApiProperty()
  @AutoMap()
  readonly firstName: string;

  @ApiProperty()
  @AutoMap()
  readonly lastName: string;

  @AutoMap()
  @ApiProperty()
  readonly dob: string;

  @AutoMap()
  @ApiProperty()
  readonly email: string;

  @AutoMap()
  @ApiProperty()
  readonly address: string;

  @AutoMap(() => BranchResponseDto)
  @ApiProperty()
  readonly branch: BranchResponseDto;

  @AutoMap(() => RoleResponseDto)
  @ApiProperty()
  role: RoleResponseDto;
}

export class UpdateUserRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  role: string;
}

export class GetAllUserQueryRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: '',
    required: false,
  })
  @IsOptional()
  branch?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phonenumber: string;

  @AutoMap()
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : [value],
  )
  role: string[] = [];

  @AutoMap()
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @AutoMap()
  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  size: number = 10;

  @AutoMap()
  @ApiProperty({
    description: 'Enable paging',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}
