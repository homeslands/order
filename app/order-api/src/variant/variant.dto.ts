import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { ProductResponseDto } from 'src/product/product.dto';
import { SizeResponseDto } from 'src/size/size.dto';

export class CreateVariantRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The price of product at this size',
    example: '50000',
  })
  @IsNotEmpty({ message: 'The price is required' })
  price: number;

  @ApiProperty({ description: 'The slug of size', example: 'XOT7hr58Q' })
  @IsNotEmpty({ message: 'The slug of size is required' })
  size: string;

  @ApiProperty({
    description: 'The slug of product',
    example: 'XOT7hr58Q',
  })
  @IsNotEmpty({ message: 'The slug of product is required' })
  product: string;
}

export class UpdateVariantRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The price of product at this size',
    example: '50000',
  })
  @IsNotEmpty({ message: 'The price is required' })
  price: number;
}

export class VariantResponseDto extends BaseResponseDto {
  @AutoMap()
  price: number;

  @AutoMap(() => SizeResponseDto)
  size: SizeResponseDto;

  @AutoMap(() => ProductResponseDto)
  product: ProductResponseDto;
}
