import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductChefArea } from './product-chef-area.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefAreaUtils } from 'src/chef-area/chef-area.utils';
import { ProductUtils } from 'src/product/product.utils';
import { ProductChefAreaUtils } from './product-chef-area.utils';
import {
  CreateProductChefAreaRequestDto,
  ProductChefAreaResponseDto,
  QueryGetProductChefAreaRequestDto,
} from './product-chef-area.dto';

@Injectable()
export class ProductChefAreaService {
  constructor(
    @InjectRepository(ProductChefArea)
    private chefAreaRepository: Repository<ProductChefArea>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly chefAreaUtils: ChefAreaUtils,
    private readonly productUtils: ProductUtils,
    private readonly productChefAreaUtils: ProductChefAreaUtils,
  ) {}

  /**
   * Create new product chef area
   * @param {CreateProductChefAreaRequestDto} requestData
   * @returns {ProductChefAreaResponseDto}
   * @throws {ChefAreaException} if chef area not found
   * @throws {ProductException} if product not found
   */
  async create(
    requestData: CreateProductChefAreaRequestDto,
  ): Promise<ProductChefAreaResponseDto> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: {
        slug: requestData.chefArea,
      },
    });
    const product = await this.productUtils.getProduct({
      slug: requestData.product,
    });
    const productChefArea = this.mapper.map(
      requestData,
      CreateProductChefAreaRequestDto,
      ProductChefArea,
    );
    Object.assign(productChefArea, {
      chefArea,
      product,
    });
    const createdProductChefArea =
      await this.chefAreaRepository.save(productChefArea);
    return this.mapper.map(
      createdProductChefArea,
      ProductChefArea,
      ProductChefAreaResponseDto,
    );
  }

  /**
   * Get all product chef areas
   * @param {QueryGetProductChefAreaRequestDto} query
   * @returns {ProductChefAreaResponseDto[]}
   * @throws {ChefAreaException} if chef area not found
   * @throws {ProductException} if product not found
   */
  async getAll(
    query: QueryGetProductChefAreaRequestDto,
  ): Promise<ProductChefAreaResponseDto[]> {
    const where: FindOneOptions<ProductChefArea> = {
      relations: ['chefArea.branch', 'product'],
    };
    if (query.chefArea) {
      const chefArea = await this.chefAreaUtils.getChefArea({
        where: {
          slug: query.chefArea,
        },
      });
      Object.assign(where, {
        chefArea,
      });
    }
    if (query.product) {
      const product = await this.productUtils.getProduct({
        slug: query.product,
      });
      Object.assign(where, {
        product,
      });
    }
    const productChefAreas = await this.chefAreaRepository.find({
      ...where,
    });
    return this.mapper.mapArray(
      productChefAreas,
      ProductChefArea,
      ProductChefAreaResponseDto,
    );
  }

  /**
   * Get specific product chef area
   * @param {string} chefAreaSlug
   * @param {string} productSlug
   * @returns {ProductChefAreaResponseDto}
   * @throws {ProductChefAreaException} if product chef area not found
   */
  async getSpecific(slug: string): Promise<ProductChefAreaResponseDto> {
    const productChefArea = await this.productChefAreaUtils.getProductChefArea({
      where: { slug },
      relations: ['chefArea.branch', 'product'],
    });
    return this.mapper.map(
      productChefArea,
      ProductChefArea,
      ProductChefAreaResponseDto,
    );
  }

  /**
   * Update product chef area
   * @param {string} slug
   * @param {CreateProductChefAreaRequestDto} requestData
   * @returns {ProductChefAreaResponseDto}
   * @throws {ProductChefAreaException} if product chef area not found
   * @throws {ChefAreaException} if chef area not found
   * @throws {ProductException} if product not found
   */
  async update(
    slug: string,
    requestData: CreateProductChefAreaRequestDto,
  ): Promise<ProductChefAreaResponseDto> {
    const productChefArea = await this.productChefAreaUtils.getProductChefArea({
      where: { slug },
    });
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug: requestData.chefArea },
    });
    const product = await this.productUtils.getProduct({
      slug: requestData.product,
    });
    const productChefAreaData = this.mapper.map(
      requestData,
      CreateProductChefAreaRequestDto,
      ProductChefArea,
    );
    Object.assign(productChefArea, {
      ...productChefAreaData,
      chefArea,
      product,
    });
    const updatedProductChefArea =
      await this.chefAreaRepository.save(productChefArea);
    return this.mapper.map(
      updatedProductChefArea,
      ProductChefArea,
      ProductChefAreaResponseDto,
    );
  }

  /**
   * Delete product chef area
   * @param {string} slug
   * @returns {ProductChefAreaResponseDto}
   * @throws {ProductChefAreaException} if product chef area not found
   */
  async delete(slug: string): Promise<number> {
    const productChefArea = await this.productChefAreaUtils.getProductChefArea({
      where: { slug },
    });
    const result = await this.chefAreaRepository.softDelete(productChefArea.id);
    return result.affected || 0;
  }
}
