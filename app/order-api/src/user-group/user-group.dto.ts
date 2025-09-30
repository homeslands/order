import { AutoMap } from '@automapper/classes';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import { Transform } from 'class-transformer';
import { GeneralUserResponseDto } from 'src/user/user.dto';

export class CreateUserGroupDto {
  @ApiProperty({
    description: 'The name of user group',
    example: 'Marketing Group',
  })
  @IsNotEmpty({ message: 'The name of user group is required' })
  @IsString({ message: 'The name of user group must be a string' })
  @MinLength(2, {
    message: 'The name of user group must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'The name of user group must be less than 100 characters',
  })
  @AutoMap()
  name: string;

  @ApiPropertyOptional({
    description: 'The description of user group',
    example: 'The group responsible for marketing activities',
  })
  @IsOptional()
  @IsString({ message: 'The description of user group must be a string' })
  @MaxLength(500, {
    message: 'The description of user group must be less than 500 characters',
  })
  @AutoMap()
  description?: string;
}

export class UpdateUserGroupDto {
  @ApiPropertyOptional({
    description: 'The name of user group',
    example: 'Marketing Group Updated',
  })
  @IsOptional()
  @IsString({ message: 'The name of user group must be a string' })
  @MinLength(2, {
    message: 'The name of user group must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'The name of user group must be less than 100 characters',
  })
  @AutoMap()
  name?: string;

  @ApiPropertyOptional({
    description: 'The description of user group',
    example: 'The group responsible for marketing activities',
  })
  @IsOptional()
  @IsString({ message: 'The description of user group must be a string' })
  @MaxLength(500, {
    message: 'The description of user group must be less than 500 characters',
  })
  @AutoMap()
  description?: string;
}

export class UserGroupResponseDto extends BaseResponseDto {
  @AutoMap()
  name: string;

  @AutoMap()
  description?: string;

  @AutoMap(() => GeneralUserResponseDto)
  createdBy: GeneralUserResponseDto;
}

export class GetAllUserGroupQueryRequestDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Marketing',
  })
  @IsOptional()
  @IsString()
  @AutoMap()
  name?: string;

  @ApiPropertyOptional({
    description: 'Search by phone number of user group members',
    example: '0909090909',
  })
  @IsOptional()
  @IsString()
  @AutoMap()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Has paging or not',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // Default true
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  hasPaging?: boolean;
}
