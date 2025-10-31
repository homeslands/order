import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { FirebasePlatform } from './firebase.constant';

export class FirebaseSendNotificationDto {
  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  title: string;

  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  body: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  link?: string;

  @AutoMap()
  @ApiProperty({})
  @IsOptional()
  data?: Record<string, string>;
}

export class FirebaseTokenDto {
  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  token: string;

  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  platform: FirebasePlatform;
}
