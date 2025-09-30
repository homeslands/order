import { AutoMap } from '@automapper/classes';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsDefined,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralUserResponseDto, UserResponseDto } from 'src/user/user.dto';
import { UserGroupResponseDto } from 'src/user-group/user-group.dto';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';

export class AddUserToGroupDto {
  @ApiProperty({
    description: 'Slug of user',
    example: 'john-doe',
  })
  @IsNotEmpty({ message: 'User slug is required' })
  @AutoMap()
  user: string;

  @ApiProperty({
    description: 'Slug of user group',
    example: 'john-doe-group',
  })
  @IsNotEmpty({ message: 'User group slug is required' })
  @AutoMap()
  userGroup: string;
}

export class UserGroupMemberResponseDto extends BaseResponseDto {
  @AutoMap(() => UserResponseDto)
  user: UserResponseDto;

  @AutoMap(() => UserGroupResponseDto)
  userGroup: UserGroupResponseDto;

  @AutoMap(() => GeneralUserResponseDto)
  createdBy: GeneralUserResponseDto;
}

export class GetUserGroupMemberQuery extends BaseQueryDto {
  @ApiProperty({
    description: 'Slug of user group to filter members',
    example: 'john-doe-group',
    required: true,
  })
  @IsNotEmpty({ message: 'User group slug is required' })
  userGroup: string;

  @ApiProperty({
    description: 'Phone number of user group members',
    example: '0909090909',
    required: false,
  })
  @IsOptional()
  phonenumber?: string;

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

export class BulkAddUsersToGroupDto {
  @AutoMap()
  @ApiProperty({
    description: 'List of user slugs',
    example: ['john-doe', 'jane-doe', 'jane-doe-group'],
  })
  @IsDefined({ message: 'The slug array of the products is not defined' })
  @IsArray({
    message: 'The slug array of the applicable object must be an array',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  users: string[];

  @AutoMap()
  @ApiProperty({
    description: 'Slug of user group',
    example: 'john-doe-group',
  })
  @IsNotEmpty({ message: 'User group slug is required' })
  userGroup: string;
}
