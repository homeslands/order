import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FindFeatureFlagDto {
  @IsOptional()
  @ApiProperty({ required: false })
  name: string;

  @IsOptional()
  @ApiProperty({ required: false })
  slug: string;
}
