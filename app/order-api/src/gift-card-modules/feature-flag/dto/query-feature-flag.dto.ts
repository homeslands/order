import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryFeatureFlagDto {
  @IsOptional()
  @ApiProperty({ required: false })
  groupName: string;
}
