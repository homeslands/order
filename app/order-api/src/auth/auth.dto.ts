import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  INVALID_FIRSTNAME,
  INVALID_LASTNAME,
  INVALID_PASSWORD,
  INVALID_PHONENUMBER,
} from './auth.validation';
import { AutoMap } from '@automapper/classes';
import { BranchResponseDto } from 'src/branch/branch.dto';
import { RoleResponseDto } from 'src/role/role.dto';

export class LoginAuthRequestDto {
  @ApiProperty({ example: '08123456789' })
  @IsNotEmpty({ message: INVALID_PHONENUMBER })
  @AutoMap()
  phonenumber: string;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty({
    message: INVALID_PASSWORD,
  })
  @AutoMap()
  password: string;
}

export class RegisterAuthRequestDto extends LoginAuthRequestDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: INVALID_FIRSTNAME })
  @AutoMap()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty({ message: INVALID_LASTNAME })
  @AutoMap()
  lastName: string;
}

export class LoginAuthResponseDto {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;

  @ApiProperty()
  readonly expireTime: string;

  @ApiProperty()
  readonly expireTimeRefreshToken: string;
}

export class AuthRefreshRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @AutoMap()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordTokenRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  email: string;
}

export class AuthChangePasswordRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @AutoMap()
  @IsString()
  newPassword: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  token: string;

  @ApiProperty()
  @AutoMap()
  @IsString()
  newPassword: string;
}

export class EmailVerificationRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  email: string;

  @ApiProperty()
  @AutoMap()
  @IsString()
  accessToken: string;
}

export class ConFirmEmailVerificationRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  email: string;

  @ApiProperty()
  @AutoMap()
  @IsString()
  token: string;
}

export class UpdateAuthProfileRequestDto {
  @ApiProperty({ example: 'John' })
  @AutoMap()
  @IsNotEmpty({ message: INVALID_FIRSTNAME })
  readonly firstName: string;

  @ApiProperty({ example: 'Doe' })
  @AutoMap()
  @IsNotEmpty({ message: INVALID_LASTNAME })
  readonly lastName: string;

  @ApiProperty({ example: '1990-01-01' })
  @AutoMap()
  readonly dob: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @AutoMap()
  readonly email: string;

  @ApiProperty({ example: 'Jl. Raya' })
  @AutoMap()
  readonly address: string;

  @ApiProperty({ example: 'XOT7hr58Q' })
  @AutoMap()
  readonly branch: string;
}

export class AuthProfileResponseDto {
  @AutoMap()
  @ApiProperty()
  readonly slug: string;

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

  @AutoMap()
  @ApiProperty()
  readonly image: string;

  @AutoMap(() => BranchResponseDto)
  @ApiProperty()
  readonly branch: BranchResponseDto;

  @AutoMap(() => RoleResponseDto)
  @ApiProperty()
  role: RoleResponseDto;
}

// PickType: Get the fields from AuthProfileResponseDto
export class RegisterAuthResponseDto {
  @ApiProperty()
  @AutoMap()
  slug: string;

  @ApiProperty()
  @AutoMap()
  phonenumber: string;

  @ApiProperty()
  @AutoMap()
  firstName: string;

  @ApiProperty()
  @AutoMap()
  lastName: string;
}

export class AuthJwtPayload {
  sub: string;
  jti: string;
  scope: string;
}
