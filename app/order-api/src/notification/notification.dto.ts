import { AutoMap } from '@automapper/classes';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';
import { FirebasePlatform } from './firebase/firebase.constant';

export class CreateNotificationDto {
  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  message: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  senderId?: string;

  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  receiverId: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  receiverName?: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  senderName?: string;

  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  type: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  metadata?: Record<string, any>;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  title?: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  body?: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  link?: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  language?: string;
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}

export class NotificationResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty({})
  message: string;

  @AutoMap()
  @ApiProperty({})
  senderId: string;

  @AutoMap()
  @ApiProperty({})
  receiverId: string;

  @AutoMap()
  @ApiProperty({})
  type: string;

  @AutoMap()
  @ApiProperty({})
  isRead: boolean;

  @AutoMap()
  @ApiProperty({})
  metadata: any;
}

export class GetAllNotificationDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  receiver?: string;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Preserve `undefined`
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isRead?: boolean;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  type?: string;
}

export class FirebaseRegisterDeviceTokenRequestDto {
  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty({ message: 'Firebase token is required' })
  token: string;

  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  @IsEnum(FirebasePlatform, {
    message: 'Platform must be one of the following: ios, android, web',
  })
  platform: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  userAgent?: string;
}

export class FirebaseRegisterDeviceTokenResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty({})
  platform: string;
}
