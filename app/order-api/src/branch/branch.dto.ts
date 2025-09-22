import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import {
  INVALID_BRANCH_ADDRESS,
  INVALID_BRANCH_NAME,
  INVALID_BRANCH_PLACE_ID,
} from './branch.validation';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { AddressResponseDto } from 'src/google-map/dto/google-map.response.dto';

export class CreateBranchDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_BRANCH_NAME })
  name: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_BRANCH_ADDRESS })
  address: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: INVALID_BRANCH_PLACE_ID })
  placeId: string;
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

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  placeId?: string;
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

  @AutoMap(() => AddressResponseDto)
  addressDetail: AddressResponseDto;
}
