import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobType } from './job.constants';

export class CreateJobRequestDto {
  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  @IsEnum(JobType)
  type: string;

  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  data: string;
}
