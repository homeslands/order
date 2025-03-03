import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { AutoMap } from '@automapper/classes';
import { PromotionResponseDto } from 'src/promotion/promotion.dto';
import { ApplicablePromotionType } from './applicable-promotion.constant';
import { ProductResponseDto } from 'src/product/product.dto';
import { Type } from 'class-transformer';

export class CreateApplicablePromotionRequestDto {
  // @AutoMap()
  // @ApiProperty({
  //   description: 'Confirm apply this promotion from today or not',
  //   required: true,
  //   example: true,
  // })
  // @IsNotEmpty({ message: 'Confirm apply from today is required' })
  // isApplyFromToday: boolean;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be created applicable promotion',
    required: true,
    example: 'product-slug',
  })
  @IsNotEmpty({ message: 'The slug of the applicable object is required' })
  applicableSlug: string;

  @AutoMap()
  @ApiProperty({
    description: 'The type of the object to be created applicable promotion',
    required: true,
    example: 'product',
  })
  @IsNotEmpty({ message: 'The type of the applicable object is required' })
  @IsEnum(ApplicablePromotionType, { message: 'Invalid applicable promotion' })
  type: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the promotion to be created applicable promotion',
    required: true,
    example: 'promotion-slug',
  })
  @IsNotEmpty({ message: 'The slug of the promotion is required' })
  promotion: string;
}

export class CreateManyApplicablePromotionsRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be created applicable promotion',
    required: true,
    example: ['product-slug'],
  })
  @IsArray({
    message: 'The slug array of the applicable object must be an array',
  })
  @ArrayNotEmpty({
    message: 'The slug array of the applicable object is not empty',
  })
  @IsString({ each: true, message: 'Each slug in the array must be a string' })
  @Type(() => String)
  applicableSlugs: string[];

  @AutoMap()
  @ApiProperty({
    description: 'The type of the object to be created applicable promotion',
    required: true,
    example: 'product',
  })
  @IsNotEmpty({ message: 'The type of the applicable object is required' })
  @IsEnum(ApplicablePromotionType, { message: 'Invalid applicable promotion' })
  type: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the promotion to be created applicable promotion',
    required: true,
    example: 'promotion-slug',
  })
  @IsNotEmpty({ message: 'The slug of the promotion is required' })
  promotion: string;
}

export class ApplicablePromotionResponseDto {
  @AutoMap()
  type: string;

  @AutoMap(() => ProductResponseDto)
  applicableObject: ProductResponseDto;

  @AutoMap(() => PromotionResponseDto)
  promotion: PromotionResponseDto;
}

export class GetSpecificApplicablePromotionRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of the object to be applied promotion',
    required: true,
    example: 'applicable-slug',
  })
  @IsNotEmpty({ message: 'The slug of the applicable object is required' })
  applicableSlug: string;

  @AutoMap()
  @ApiProperty({
    description: 'The slug of the promotion',
    required: true,
    example: 'promotion-slug',
  })
  @IsNotEmpty({ message: 'The slug of the promotion is required' })
  promotion: string;
}
