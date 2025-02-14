import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { AutoMap } from "@automapper/classes";
import { PromotionResponseDto } from "src/promotion/promotion.dto";
import { ApplicablePromotionType } from "./applicable-promotion.constant";
import { ProductResponseDto } from "src/product/product.dto";

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
  @IsNotEmpty({message: 'The slug of the promotion is required'})
  promotion: string;
}

export class ApplicablePromotionResponseDto {
  @AutoMap()
  type: string;

  // @AutoMap(
  //   () => 
  //     ApplicablePromotionResponseDto.prototype.type === ApplicablePromotionType.PRODUCT ?
  //     ProductResponseDto : null
  // )
  // applicableObject: ProductResponseDto | null;

  @AutoMap(() => ProductResponseDto)
  applicableObject: ProductResponseDto;

  @AutoMap(() => PromotionResponseDto)
  promotion: PromotionResponseDto;
}