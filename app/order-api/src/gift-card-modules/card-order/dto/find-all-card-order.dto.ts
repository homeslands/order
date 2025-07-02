import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from 'src/app/base.dto';

export class FindAllCardOrderDto extends BaseQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  customerSlug?: string;
}
