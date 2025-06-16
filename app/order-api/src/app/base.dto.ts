import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Min } from 'class-validator';

export class BaseResponseDto {
  @AutoMap()
  createdAt: string;

  @AutoMap()
  @ApiProperty()
  slug: string;
}

export class BaseQueryDto {
  @AutoMap()
  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @AutoMap()
  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  size: number = 10;

  @AutoMap()
  @ApiProperty({
    example: ['createdAt:desc'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value]; // or split it into multiple parts
    }
    return value;
  })
  sort: string[] = [];
}
