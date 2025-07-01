import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import moment from 'moment';
import { BaseQueryDto } from 'src/app/base.dto';

export class FindAllPointTransactionDto extends BaseQueryDto {
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  @AutoMap()
  userSlug?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  type: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => moment(value, 'YYYY-MM-DD').startOf('day').toDate())
  fromDate: Date;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => moment(value, 'YYYY-MM-DD').endOf('day').toDate())
  toDate: Date;
}
