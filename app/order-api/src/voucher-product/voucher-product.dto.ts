import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ProductResponseDto } from 'src/product/product.dto';
import { VoucherResponseDto } from 'src/voucher/voucher.dto';

export class CreateVoucherProductRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be created voucher product',
    required: true,
    example: ['product-slug'],
  })
  @IsArray({
    message: 'The slug array of the products must be an array',
  })
  @ArrayNotEmpty({
    message: 'The slug array of the products is not empty',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  products: string[];

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be created voucher product',
    required: true,
    example: ['product-slug'],
  })
  @IsArray({
    message: 'The slug array of the vouchers must be an array',
  })
  @ArrayNotEmpty({
    message: 'The slug array of the vouchers is not empty',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  vouchers: string[];
}

export class DeleteVoucherProductRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be delete voucher product',
    required: true,
    example: ['product-slug'],
  })
  @IsArray({
    message: 'The slug array of the products must be an array',
  })
  @ArrayNotEmpty({
    message: 'The slug array of the products is not empty',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  products: string[];

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be delete voucher product',
    required: true,
    example: ['product-slug'],
  })
  @IsArray({
    message: 'The slug array of the vouchers must be an array',
  })
  @ArrayNotEmpty({
    message: 'The slug array of the vouchers is not empty',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  vouchers: string[];
}

export class VoucherProductResponseDto {
  @AutoMap()
  @ApiProperty()
  voucher: VoucherResponseDto;

  @AutoMap()
  @ApiProperty()
  product: ProductResponseDto;
}
