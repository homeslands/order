import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { FeatureGroupResponseDto } from './feature-group-response.dto';
import { BaseResponseDto } from 'src/app/base.dto';

export class FeatureFlagResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  groupName: string;

  @ApiProperty()
  @AutoMap()
  groupSlug: string;

  @ApiProperty()
  @AutoMap()
  name: string;

  @ApiProperty()
  @AutoMap()
  isLocked: boolean;

  @ApiProperty()
  @AutoMap()
  order: number;

  @ApiProperty()
  @AutoMap(() => FeatureGroupResponseDto)
  group: FeatureGroupResponseDto;
}
