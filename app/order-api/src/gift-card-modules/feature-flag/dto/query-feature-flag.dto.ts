import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class QueryFeatureFlagDto {
  @Optional()
  @ApiProperty({ required: false })
  group: string;
}
