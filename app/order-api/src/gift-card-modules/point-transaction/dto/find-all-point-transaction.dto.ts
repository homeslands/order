import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseQueryDto } from 'src/app/base.dto';

export class FindAllPointTransactionDto extends BaseQueryDto {
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  @AutoMap()
  userSlug?: string;
}
