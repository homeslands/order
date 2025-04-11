import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/app/base.dto';

export class InvoiceItemResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty()
  productName: string;

  @AutoMap()
  @ApiProperty()
  quantity: number;

  @AutoMap()
  @ApiProperty()
  price: number;

  @AutoMap()
  @ApiProperty()
  total: number;

  @AutoMap()
  @ApiProperty()
  promotionValue: number;

  @AutoMap()
  @ApiProperty()
  size: string;
}
