import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { ZaloOaStrategy } from './zalo-oa-connector.constants';

export class ZaloOaInitiateSmsRequestDto {
  ApiKey: string;
  SecretKey: string;
  OAID: string;
  Phone: string;
  TempData: ZaloOaInitiateSmsTemplateDataDto;
  TempID: string;
  campaignid: string;
  RequestId?: string;
  CallbackUrl?: string;
}

export class ZaloOaInitiateSmsTemplateDataDto {
  otp: string;
  time: string;
}

export class ZaloOaInitiateSmsResponseDto {
  CodeResult: string;
  CountRegenerate: number;
  SMSID?: string;
  ErrorMessage?: string;
}

export class CreateZaloOaConnectorConfigRequestDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty({ message: 'Strategy is required' })
  @ApiProperty({
    description: 'Strategy',
    example: 'zalo-oa-strategy',
    required: true,
  })
  @IsEnum(ZaloOaStrategy, { message: 'Invalid strategy' })
  strategy: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty({ message: 'Template ID is required' })
  @ApiProperty({
    description: 'Template ID',
    example: '1234567890',
    required: true,
  })
  templateId: string;
}

export class ZaloOaConnectorConfigResponseDto extends BaseResponseDto {
  @AutoMap()
  strategy: string;

  @AutoMap()
  templateId: string;
}

export class ZaloOaCallbackStatusRequestDto {
  @ApiProperty({
    description: 'ID of the SMS message',
    example: 'f66545d2-c7e2-4603-984e-d2238c363c8292',
    required: false,
  })
  @IsOptional()
  @IsString()
  SMSID?: string;

  @ApiProperty({
    description: 'Indicates if the send failed (1 = failed)',
    example: '1',
    required: false,
  })
  @IsOptional()
  SendFailed?: string;

  @ApiProperty({
    description: 'Status code of the send process',
    example: '5',
    required: false,
  })
  @IsOptional()
  SendStatus?: string;

  @ApiProperty({
    description: 'Indicates if the send was successful (1 = success)',
    example: '0',
    required: false,
  })
  @IsOptional()
  SendSuccess?: string;

  @ApiProperty({
    description: 'Total price of the send operation',
    example: '0.0000',
    required: false,
  })
  @IsOptional()
  @IsString()
  TotalPrice?: string;

  @ApiProperty({
    description: 'Total number of receivers',
    example: '1',
    required: false,
  })
  @IsOptional()
  TotalReceiver?: string;

  @ApiProperty({
    description: 'Total number of messages sent',
    example: '0',
    required: false,
  })
  @IsOptional()
  TotalSent?: string;

  @ApiProperty({
    description: 'Request ID (can be empty)',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  RequestId?: string;

  @ApiProperty({
    description: 'Type ID for the message',
    example: '25',
    required: false,
  })
  @IsOptional()
  TypeId?: string;

  @ApiProperty({
    description: 'Telco ID (e.g. 2 = Viettel, etc.)',
    example: '2',
    required: false,
  })
  @IsOptional()
  telcoid?: string;

  @ApiProperty({
    description: 'Recipient phone number',
    example: '0901888484',
    required: false,
  })
  @IsOptional()
  @IsString()
  phonenumber?: string;

  @ApiProperty({
    description: 'Partner IDs (could be empty or comma-separated)',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  partnerids?: string;

  @ApiProperty({
    description: 'Error information, encoded JSON string',
    example:
      '"{"error":-114,"message":"User is inactive, or reject the message, or using an outdated Zalo version, or other internal errors"}"',
    required: false,
  })
  @IsOptional()
  @IsString()
  error_info?: string;

  @ApiProperty({
    description: 'OAID (Zalo Official Account ID)',
    example: '1397492183140006179',
    required: false,
  })
  @IsOptional()
  @IsString()
  oaid?: string;

  @ApiProperty({
    description: 'Template ID of the message',
    example: '2056446',
    required: false,
  })
  @IsOptional()
  tempid?: string;
}
