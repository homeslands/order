import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GenGiftCardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  cardSlug: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  cardOrderSlug: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  quantity: number;
}
