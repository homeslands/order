import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { UserGroupResponseDto } from 'src/user-group/user-group.dto';
import { VoucherResponseDto } from 'src/voucher/voucher.dto';

export class BulkCreateVoucherUserGroupRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The array of voucher slugs',
    example: ['voucher-slug-1', 'voucher-slug-2'],
  })
  @IsArray({ message: 'The array of voucher slugs must be an array' })
  @IsNotEmpty({ message: 'The array of voucher slugs is not empty' })
  @IsString({ each: true, message: 'Each voucher slug must be a string' })
  vouchers: string[];

  @ApiProperty({
    description: 'The array of user group slugs',
    example: ['user-group-slug-1', 'user-group-slug-2'],
  })
  @IsArray({ message: 'The array of user group slugs must be an array' })
  @IsNotEmpty({ message: 'The array of user group slugs is not empty' })
  @IsString({ each: true, message: 'Each user group slug must be a string' })
  userGroups: string[];
}

export class VoucherUserGroupResponseDto {
  @AutoMap(() => VoucherResponseDto)
  voucher: VoucherResponseDto;

  @AutoMap(() => UserGroupResponseDto)
  userGroup: string;
}

export class DeleteVoucherUserGroupRequestDto {
  @ApiProperty({
    description: 'The slug of the voucher to delete voucher user group',
    example: 'voucher-slug-1',
  })
  @IsString({
    message:
      'The slug of the voucher to delete voucher user group must be a string',
  })
  @IsNotEmpty({
    message:
      'The slug of the voucher to delete voucher user group is not empty',
  })
  voucher: string;

  @ApiProperty({
    description: 'The slug of the user group to delete voucher user group',
    example: 'user-group-slug-1',
  })
  @IsString({
    message:
      'The slug of the user group to delete voucher user group must be a string',
  })
  @IsNotEmpty({
    message:
      'The slug of the user group to delete voucher user group is not empty',
  })
  userGroup: string;
}
