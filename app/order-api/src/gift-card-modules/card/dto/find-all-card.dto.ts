import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/app/base.dto';

export class FindAllCardDto extends BaseQueryDto {
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  @AutoMap()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
