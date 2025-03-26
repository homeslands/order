import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import {
  INVALID_BRANCH_ADDRESS,
  INVALID_BRANCH_NAME,
} from './branch.validation';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';

export class CreateBranchDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_BRANCH_NAME })
  name: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_BRANCH_ADDRESS })
  address: string;
}

export class UpdateBranchDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_BRANCH_NAME })
  name: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_BRANCH_ADDRESS })
  address: string;
}

export class BranchResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  address: string;

  @AutoMap(() => [ChefAreaResponseDto])
  chefAreas: ChefAreaResponseDto[];
}
