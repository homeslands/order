import { AutoMap } from '@automapper/classes';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';

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

export class GetAllNotificationDto {
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
