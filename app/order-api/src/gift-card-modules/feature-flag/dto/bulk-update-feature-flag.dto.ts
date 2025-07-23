import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class BulkUpdateFeatureFlagDto {
  @ApiProperty()
  @IsArray()
  updates: UpdateFeatureFlagDto[];
}

export class UpdateFeatureFlagDto {
  slug: string;
  isLocked: boolean;
}
