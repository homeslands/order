import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Variant } from './variant.entity';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateVariantRequestDto,
  UpdateVariantRequestDto,
  VariantResponseDto,
} from './variant.dto';
import { Product } from 'src/product/product.entity';
import { Size } from 'src/size/size.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SizeException } from 'src/size/size.exception';
import { SizeValidation } from 'src/size/size.validation';
import { ProductException } from 'src/product/product.exception';
import ProductValidation from 'src/product/product.validation';
import { VariantException } from './variant.exception';
import { VariantValidation } from './variant.validation';

@Injectable()
export class VariantService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @InjectMapper() private readonly mapper: Mapper,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Create a new variant
   * @param {CreateVariantRequestDto} createVariantDto The data to create a new variant
   * @returns {Promise<VariantResponseDto>} The created variant data
   * @throws {SizeException} If the size is not found
   * @throws {ProductException} If the product is not found
   * @throws {VariantException} If the variant already exists
   */
  async createVariant(
    createVariantDto: CreateVariantRequestDto,
  ): Promise<VariantResponseDto> {
    const context = `${VariantService.name}.${this.createVariant.name}`;
    const size = await this.sizeRepository.findOne({
      where: { slug: createVariantDto.size },
    });
    if (!size) {
      this.logger.warn(`Size ${createVariantDto.size} not found`, context);
      throw new SizeException(SizeValidation.SIZE_NOT_FOUND);
    }

    const product = await this.productRepository.findOne({
      where: { slug: createVariantDto.product },
    });
    if (!product) {
      this.logger.warn(
        `Product ${createVariantDto.product} not found`,
        context,
      );
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    const variant = await this.variantRepository.findOne({
      where: {
        size: {
          slug: createVariantDto.size,
        },
        product: {
          slug: createVariantDto.product,
        },
      },
    });
    if (variant) {
      this.logger.warn(
        `Variant both size ${createVariantDto.size} and product ${createVariantDto.product} does exists`,
        context,
      );
      throw new VariantException(VariantValidation.VARIANT_DOES_EXIST);
    }

    const variantData = this.mapper.map(
      createVariantDto,
      CreateVariantRequestDto,
      Variant,
    );
    Object.assign(variantData, { size, product });
    const newVariant = this.variantRepository.create(variantData);
    const createdVariant = await this.variantRepository.save(newVariant);
    this.logger.log(
      `Variant with both size ${createVariantDto.size} and product ${createVariantDto.product} created successfully`,
      context,
    );
    const variantDto = this.mapper.map(
      createdVariant,
      Variant,
      VariantResponseDto,
    );
    return variantDto;
  }

  /**
   * Get all variants
   * @returns {Promise<VariantResponseDto[]>} The variant array is retrieved
   */
  async getAllVariants(product: string): Promise<VariantResponseDto[]> {
    const variants = await this.variantRepository.find({
      where: {
        product: {
          slug: product,
        },
      },
      relations: ['size', 'product'],
    });
    const variantsDto = this.mapper.mapArray(
      variants,
      Variant,
      VariantResponseDto,
    );
    return variantsDto;
  }

  /**
   * Update variant data
   * @param {string} slug The slug of variant is updated
   * @param {UpdateVariantRequestDto} requestData The data to update variant
   * @returns {Promise<VariantResponseDto>} The updated variant data
   * @throws {VariantException} If variant is not found
   */
  async updateVariant(
    slug: string,
    requestData: UpdateVariantRequestDto,
  ): Promise<VariantResponseDto> {
    const context = `${VariantService.name}.${this.updateVariant.name}`;
    const variant = await this.variantRepository.findOne({
      where: { slug },
      relations: ['size', 'product'],
    });
    if (!variant) {
      this.logger.warn(`Variant ${slug} not found`, context);
      throw new VariantException(VariantValidation.VARIANT_NOT_FOUND);
    }

    Object.assign(variant, requestData);
    const updatedVariant = await this.variantRepository.save(variant);
    this.logger.log(`Variant ${slug} updated successfully`, context);
    const variantDto = this.mapper.map(
      updatedVariant,
      Variant,
      VariantResponseDto,
    );
    return variantDto;
  }

  /**
   * Delete variant by slug
   * @param {string} slug The slug of variant is deleted
   * @returns {Promise<number>} The number of variants is deleted
   * @throws {VariantException} If variant is not found
   */
  async deleteVariant(slug: string): Promise<number> {
    const context = `${VariantService.name}.${this.deleteVariant.name}`;

    const variant = await this.variantRepository.findOneBy({ slug });
    if (!variant) {
      this.logger.warn(`Variant ${slug} not found`, context);
      throw new VariantException(VariantValidation.VARIANT_NOT_FOUND);
    }

    const deleted = await this.variantRepository.softDelete({ slug });
    this.logger.log(`Variant ${slug} deleted successfully`, context);
    return deleted.affected || 0;
  }
}
