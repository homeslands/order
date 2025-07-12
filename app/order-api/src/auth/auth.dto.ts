import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsEmail, Matches } from 'class-validator';
import {
  // INVALID_EMAIL,
  // INVALID_FIRSTNAME,
  // INVALID_LASTNAME,
  INVALID_PASSWORD,
  INVALID_PHONENUMBER,
  INVALID_EMAIL,
} from './auth.validation';
import { AutoMap } from '@automapper/classes';
import { BranchResponseDto } from 'src/branch/branch.dto';
import { RoleResponseDto } from 'src/role/role.dto';
import { VIETNAMESE_PHONE_REGEX } from './constants';

export class LoginAuthRequestDto {
  @ApiProperty({ example: '0376295216' })
  @IsNotEmpty({ message: INVALID_PHONENUMBER })
  @Matches(VIETNAMESE_PHONE_REGEX, { message: 'Phone number must be a valid Vietnamese phone number (10 digits starting with 03, 05, 07, 08, or 09)' })
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
  // @IsNotEmpty({ message: INVALID_FIRSTNAME })
  @IsOptional()
  @AutoMap()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  // @IsNotEmpty({ message: INVALID_LASTNAME })
  @IsOptional()
  @AutoMap()
  lastName?: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsOptional()
  @IsEmail({}, { message: INVALID_EMAIL })
  @AutoMap()
  email?: string;
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
  @IsEmail({}, { message: INVALID_EMAIL })
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

export class InitiateVerifyEmailRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  @IsEmail({}, { message: INVALID_EMAIL })
  email: string;
}
export class VerifyEmailResponseDto {
  @ApiProperty()
  @AutoMap()
  @IsDate()
  expiresAt: Date;
}
export class VerifyPhoneNumberResponseDto {
  @ApiProperty()
  @AutoMap()
  @IsDate()
  expiresAt: Date;
}
export class ConfirmEmailVerificationCodeRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  code: string;
}
export class ConfirmPhoneNumberVerificationCodeRequestDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  code: string;
}

export class UpdateAuthProfileRequestDto {
  @ApiProperty({ example: 'John' })
  @AutoMap()
  // @IsNotEmpty({ message: INVALID_FIRSTNAME })
  @IsOptional()
  readonly firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @AutoMap()
  // @IsNotEmpty({ message: INVALID_LASTNAME })
  @IsOptional()
  readonly lastName?: string;

  @ApiProperty({ example: '1990-01-01' })
  @AutoMap()
  readonly dob: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @AutoMap()
  @IsOptional()
  @IsEmail({}, { message: INVALID_EMAIL })
  readonly email?: string;

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

  @AutoMap()
  @ApiProperty()
  readonly image: string;

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
  firstName?: string;

  @ApiProperty()
  @AutoMap()
  lastName?: string;
}

export class AuthJwtPayload {
  sub: string;
  jti: string;
  scope?: string;
  exp?: number;
}
