import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCardOrderDto {
  @IsString()
  @IsNotEmpty()
  customerSlug: string;

  @IsString()
  @IsNotEmpty()
  cashierSlug: string;

  @IsString()
  @IsNotEmpty()
  cardOrderType: string;

  @IsString()
  @IsNotEmpty()
  cardSlug: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsArray()
  receipients: CreateReceipientDto[];
}

export class CreateReceipientDto {
  @IsString()
  @IsNotEmpty()
  recipientSlug: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  message?: string;
}
