import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  title: string;

  @IsOptional()
  @ApiProperty()
  @AutoMap()
  description: string;

  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  @Transform(({ value }) => Number(value))
  points: number;

  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  @Transform(({ value }) => Number(value))
  price: number;

  @IsOptional()
  @ApiProperty()
  @AutoMap()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive: boolean;
}
