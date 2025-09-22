import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetAddressDirectionDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_BRANCH' })
  branch: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_LAT_DESTINATION' })
  lat: number;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_LNG_DESTINATION' })
  lng: number;
}

export class GetAddressDistanceAndDurationDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_BRANCH' })
  branch: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_LAT_DESTINATION' })
  lat: number;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: 'INVALID_LNG_DESTINATION' })
  lng: number;
}
