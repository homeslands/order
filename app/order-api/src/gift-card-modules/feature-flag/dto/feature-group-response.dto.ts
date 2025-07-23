import { AutoMap } from '@automapper/classes';
import { FeatureFlagResponseDto } from './feature-flag-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';

export class FeatureGroupResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap(() => FeatureFlagResponseDto)
  @ApiProperty()
  features: FeatureFlagResponseDto[];

  @ApiProperty()
  @AutoMap()
  order: number;
}
