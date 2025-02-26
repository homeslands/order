import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';

export class CreateTableRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The table name', example: 'Bàn 1' })
  @IsNotEmpty()
  name: string;

  @AutoMap()
  @ApiProperty({ description: 'The slug of branch', example: '' })
  @IsNotEmpty()
  branch: string;

  @AutoMap()
  @ApiProperty({
    description: 'The location of table',
  })
  location: string;

  @AutoMap()
  @ApiProperty({ description: 'The x position of table', example: 1 })
  @IsOptional()
  xPosition?: number;

  @AutoMap()
  @ApiProperty({ description: 'The y position of table', example: 1 })
  @IsOptional()
  yPosition?: number;

  @AutoMap()
  @ApiProperty({ description: 'The status of table', example: 'available' })
  status: string;
}

export class UpdateTableRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The name of table', example: 'Bàn 1' })
  @IsNotEmpty()
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The real location of table',
  })
  @IsNotEmpty()
  location: string;

  @AutoMap()
  @ApiProperty({ description: 'The x position of table', example: 1 })
  @IsOptional()
  xPosition?: number;

  @AutoMap()
  @ApiProperty({ description: 'The y position of table', example: 1 })
  @IsOptional()
  yPosition?: number;
}

export class UpdateTableStatusRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The status of table', example: 'active' })
  @IsNotEmpty()
  status: string;
}

export class TableResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  location: string;

  @AutoMap()
  @ApiProperty()
  xPosition: number;

  @AutoMap()
  @ApiProperty()
  yPosition: number;

  @AutoMap()
  @ApiProperty()
  status: string;
}
