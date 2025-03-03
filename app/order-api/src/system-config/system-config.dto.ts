import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  SYSTEM_CONFIG_KEY_INVALID,
  SYSTEM_CONFIG_VALUE_INVALID,
} from './system-config.validation';

export class CreateSystemConfigDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: SYSTEM_CONFIG_KEY_INVALID })
  key: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: SYSTEM_CONFIG_VALUE_INVALID })
  value: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  description?: string;
}

export class UpdateSystemConfigDto extends CreateSystemConfigDto {}

export class DeleteSystemConfigDto {
  @AutoMap()
  @ApiProperty()
  @IsOptional()
  key: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  slug: string;
}

export class GetSystemConfigQueryDto {
  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  key?: string;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  slug?: string;
}

export class SystemConfigResponseDto {
  @AutoMap()
  @ApiProperty()
  key: string;

  @AutoMap()
  @ApiProperty()
  value: string;

  @AutoMap()
  @ApiProperty()
  description?: string;
}
