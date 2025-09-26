import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';

export class FeatureFlagSystemResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  isLocked: boolean;

  @AutoMap()
  @ApiProperty()
  order: number;

  @AutoMap()
  @ApiProperty()
  groupName: string;
}

export class FeatureSystemGroupResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  order: number;
}

export class BulkUpdateFeatureFlagSystemRequestDto {
  @ApiProperty({
    description: 'The array of feature flag system',
    example: [
      {
        slug: 'feature-flag-system-slug-123',
        isLocked: true,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFeatureFlagSystemRequestDto)
  updates: UpdateFeatureFlagSystemRequestDto[];
}

export class UpdateFeatureFlagSystemRequestDto {
  @ApiProperty({
    description: 'The slug of feature flag system',
    example: 'feature-flag-system-slug-123',
  })
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'The is locked of feature flag system',
    example: true,
  })
  @IsNotEmpty()
  isLocked: boolean;
}
