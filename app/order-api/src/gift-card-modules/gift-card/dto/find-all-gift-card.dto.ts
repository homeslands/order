import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import moment from 'moment';
import { BaseQueryDto } from 'src/app/base.dto';

export class FindAllGiftCardDto extends BaseQueryDto {
  @IsOptional()
  @ApiProperty({ required: false })
  customerSlug?: string;

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

  @IsOptional()
  @ApiProperty({ required: false })
  status: string;
}
