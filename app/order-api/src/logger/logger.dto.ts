import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseQueryDto, BaseResponseDto } from 'src/app/base.dto';

export class LoggerResponseDto extends BaseResponseDto {
  @AutoMap()
  level: string;

  @AutoMap()
  message: string;

  @AutoMap()
  context: string;

  @AutoMap()
  timestamp: string;

  @AutoMap()
  pid: number;
}

export class GetLoggerRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    example: 'info',
    description: 'Log level',
    enum: ['info', 'warn', 'error', 'debug'],
  })
  @IsOptional()
  level: string;
}
