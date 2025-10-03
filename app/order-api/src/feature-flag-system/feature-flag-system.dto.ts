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
  groupName: string;

  @AutoMap()
  @ApiProperty()
  description: string;

  @AutoMap(() => [ChildFeatureFlagSystemResponseDto])
  @ApiProperty()
  children: ChildFeatureFlagSystemResponseDto[];
}

export class FeatureSystemGroupResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap(() => [FeatureFlagSystemResponseDto])
  @ApiProperty()
  features: FeatureFlagSystemResponseDto[];
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

export class BulkUpdateChildFeatureFlagSystemRequestDto {
  @ApiProperty({
    description: 'The array of child feature flag system',
    example: [
      {
        slug: 'child-feature-flag-system-slug-123',
        isLocked: true,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChildFeatureFlagSystemRequestDto)
  updates: UpdateChildFeatureFlagSystemRequestDto[];
}

export class UpdateChildFeatureFlagSystemRequestDto {
  @ApiProperty({
    description: 'The slug of child feature flag system',
    example: 'child-feature-flag-system-slug-123',
  })
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'The is locked of child feature flag system',
    example: true,
  })
  @IsNotEmpty()
  isLocked: boolean;
}

export class ChildFeatureFlagSystemResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  isLocked: boolean;

  @AutoMap()
  @ApiProperty()
  parentName: string;
}
