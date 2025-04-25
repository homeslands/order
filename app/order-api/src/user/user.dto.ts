import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import {
  INVALID_ADDRESS,
  INVALID_DOB,
  INVALID_EMAIL,
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
  // @IsNotEmpty({ message: INVALID_FIRSTNAME })
  @IsOptional()
  @AutoMap()
  firstName?: string;

  @ApiProperty()
  // @IsNotEmpty({ message: INVALID_LASTNAME })
  @IsOptional()
  @AutoMap()
  lastName?: string;

  @ApiProperty()
  @IsOptional()
  branch?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Invalid role' })
  role: string;
}

export class UserScopeDto {
  role: string;
  permissions: string[];
}

export class CurrentUserDto {
  @IsNotEmpty({ message: INVALID_USERID })
  userId: string;

  @IsOptional()
  scope?: UserScopeDto;
}

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty()
  @AutoMap()
  readonly phonenumber: string;

  @ApiProperty()
  @AutoMap()
  readonly firstName?: string;

  @ApiProperty()
  @AutoMap()
  readonly lastName?: string;

  @AutoMap()
  @ApiProperty()
  readonly dob: string;

  @AutoMap()
  @ApiProperty()
  readonly email?: string;

  @AutoMap()
  @ApiProperty()
  readonly address: string;

  @AutoMap(() => BranchResponseDto)
  @ApiProperty()
  readonly branch: BranchResponseDto;

  @AutoMap(() => RoleResponseDto)
  @ApiProperty()
  role: RoleResponseDto;

  @AutoMap()
  @ApiProperty()
  isVerifiedEmail: boolean;

  @AutoMap()
  @ApiProperty()
  isVerifiedPhonenumber: boolean;
}

export class UpdateUserRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  role: string;
}

export class UpdateUserRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_FIRSTNAME })
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({ message: INVALID_LASTNAME })
  lastName: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsNotEmpty({ message: INVALID_DOB })
  dob: string;

  @ApiProperty()
  @IsNotEmpty({ message: INVALID_EMAIL })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: INVALID_ADDRESS })
  address: string;

  @ApiProperty()
  @IsOptional()
  branch?: string;
}

export class GetAllUserQueryRequestDto extends BaseQueryDto {
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
