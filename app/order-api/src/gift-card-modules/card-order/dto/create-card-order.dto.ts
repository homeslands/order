import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateReceipientDto } from 'src/gift-card-modules/receipient/dto/create-recipient.dto';
import { CardOrderType } from '../card-order.enum';

export class CreateCardOrderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  customerSlug: string;

  @IsOptional()
  @ApiProperty()
  cashierSlug: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(CardOrderType)
  cardOrderType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cardSlug: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  totalAmount: number;

  @IsArray()
  @ApiProperty()
  @Type(() => CreateReceipientDto)
  receipients: CreateReceipientDto[];
}
