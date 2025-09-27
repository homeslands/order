import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  BRANCH_CONFIG_KEY_INVALID,
  BRANCH_CONFIG_VALUE_INVALID,
  BRANCH_SLUG_INVALID,
} from './branch-config.validation';

export class CreateBranchConfigDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: BRANCH_SLUG_INVALID })
  branchSlug: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: BRANCH_CONFIG_KEY_INVALID })
  key: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: BRANCH_CONFIG_VALUE_INVALID })
  value: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  description?: string;
}

export class UpdateBranchConfigDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: BRANCH_CONFIG_KEY_INVALID })
  key: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: BRANCH_CONFIG_VALUE_INVALID })
  value: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  description?: string;
}

export class DeleteBranchConfigDto {
  @AutoMap()
  @ApiProperty()
  @IsOptional()
  key: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  slug: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: BRANCH_SLUG_INVALID })
  branchSlug: string;
}

export class GetBranchConfigQueryDto {
  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  key?: string;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  slug?: string;

  @AutoMap()
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: BRANCH_SLUG_INVALID })
  branchSlug: string;
}

export class BranchConfigResponseDto {
  @AutoMap()
  @ApiProperty()
  key: string;

  @AutoMap()
  @ApiProperty()
  value: string;

  @AutoMap()
  @ApiProperty()
  description?: string;
}
