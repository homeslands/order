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
  CreateManyProductChefAreasRequestDto,
  CreateProductChefAreaRequestDto,
  ProductChefAreaGroupByChefAreaResponseDto,
  ProductChefAreaResponseDto,
  QueryGetProductChefAreaRequestDto,
} from './product-chef-area.dto';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { ProductChefAreaException } from './product-chef-area.exception';
import ProductChefAreaValidation from './product-chef-area.validation';
import { Product } from 'src/product/product.entity';
import { ProductResponseDto } from 'src/product/product.dto';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
@Injectable()
export class ProductChefAreaService {
  constructor(
    @InjectRepository(ProductChefArea)
    private productChefAreaRepository: Repository<ProductChefArea>,
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
      relations: ['branch'],
    });
    const product = await this.productUtils.getProduct({
      where: { slug: requestData.product },
      relations: ['catalog', 'variants'],
    });

    // a product only belong to one chef area of branch
    await this.productChefAreaUtils.validateProductChefAreaExistInBranch(
      product.id,
      chefArea.branch.id,
    );

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
      await this.productChefAreaRepository.save(productChefArea);
    return this.mapper.map(
      createdProductChefArea,
      ProductChefArea,
      ProductChefAreaResponseDto,
    );
  }

  /**
   * Create many product chef areas
   * @param {CreateManyProductChefAreasRequestDto} requestData
   * @returns {ProductChefAreaResponseDto[]}
   * @throws {ProductChefAreaException} if error when creating product chef areas
   * @throws {ChefAreaException} if chef area not found
   * @throws {ProductException} if product not found
   */
  async createMany(
    requestData: CreateManyProductChefAreasRequestDto,
  ): Promise<ProductChefAreaResponseDto[]> {
    const context = `${ProductChefAreaService.name}.${this.createMany.name}`;
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: {
        slug: requestData.chefArea,
      },
      relations: ['branch'],
    });

    const constructProductChefAreas = await Promise.all(
      requestData.products.map((productSlug) =>
        this.constructProductChefArea(chefArea, productSlug),
      ),
    );

    const createdProductChefAreas =
      await this.productChefAreaRepository.manager.transaction(
        async (manager) => {
          try {
            const productChefAreas = await manager.save(
              constructProductChefAreas,
            );
            return productChefAreas;
          } catch (error) {
            this.logger.error(
              `Error when creating product chef areas: ${error}`,
              error.stack,
              context,
            );
            throw new ProductChefAreaException(
              ProductChefAreaValidation.ERROR_WHEN_CREATE_MANY_PRODUCT_CHEF_AREAS,
            );
          }
        },
      );
    return this.mapper.mapArray(
      createdProductChefAreas,
      ProductChefArea,
      ProductChefAreaResponseDto,
    );
  }

  /**
   *  Construct product chef area
   * @param {ChefArea} chefArea
   * @param {string} productSlug
   * @returns {ProductChefArea} productChefArea
   * @throws {ProductException} if product not found
   * @throws {ProductChefAreaException} if product chef area already exist in branch
   */
  async constructProductChefArea(
    chefArea: ChefArea,
    productSlug: string,
  ): Promise<ProductChefArea> {
    const product = await this.productUtils.getProduct({
      where: { slug: productSlug },
    });
    await this.productChefAreaUtils.validateProductChefAreaExistInBranch(
      product.id,
      chefArea.branch.id,
    );
    const productChefArea = new ProductChefArea();
    Object.assign(productChefArea, {
      chefArea,
      product,
    });
    return productChefArea;
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
  ): Promise<ProductChefAreaGroupByChefAreaResponseDto[]> {
    const options: FindOneOptions<ProductChefArea> = {};
    options.relations = ['chefArea.branch', 'product'];
    if (query.chefArea) {
      const chefArea = await this.chefAreaUtils.getChefArea({
        where: {
          slug: query.chefArea,
        },
      });
      options.where = { ...options.where, chefArea: { slug: chefArea.slug } };
    }
    if (query.product) {
      const product = await this.productUtils.getProduct({
        where: { slug: query.product },
        relations: ['catalog', 'variants'],
      });
      options.where = { ...options.where, product: { slug: product.slug } };
    }
    const productChefAreas = await this.productChefAreaRepository.find({
      ...options,
    });

    const groupedData = productChefAreas.reduce((acc, item) => {
      const { chefArea, product, slug } = item;

      const existingGroup = acc.find(
        (group) => group.chefArea.slug === chefArea.slug,
      );

      if (existingGroup) {
        existingGroup.products.push(
          this.mapper.map(product, Product, ProductResponseDto),
        );
      } else {
        const productDto = this.mapper.map(
          product,
          Product,
          ProductResponseDto,
        );
        Object.assign(productDto, { productChefArea: slug });
        acc.push({
          chefArea: this.mapper.map(chefArea, ChefArea, ChefAreaResponseDto),
          products: [productDto],
        });
      }

      return acc;
    }, []);
    // const productChefAreaDtos = this.mapper.mapArray(
    //   productChefAreas,
    //   ProductChefArea,
    //   ProductChefAreaResponseDto,
    // );

    // const groupedData = productChefAreaDtos.reduce((acc, item) => {
    //   const { chefArea, product } = item;

    //   const existingGroup = acc.find(
    //     (group) => group.chefArea.slug === chefArea.slug,
    //   );

    //   if (existingGroup) {
    //     existingGroup.products.push(product);
    //   } else {
    //     acc.push({
    //       chefArea,
    //       products: [product],
    //     });
    //   }

    //   return acc;
    // }, []);

    return groupedData;
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
      relations: ['branch'],
    });
    const product = await this.productUtils.getProduct({
      where: { slug: requestData.product },
      relations: ['catalog', 'variants'],
    });
    // a product only belong to one chef area of branch
    await this.productChefAreaUtils.validateProductChefAreaExistInBranch(
      product.id,
      chefArea.branch.id,
    );
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
      await this.productChefAreaRepository.save(productChefArea);
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
    const result = await this.productChefAreaRepository.softDelete(
      productChefArea.id,
    );
    return result.affected || 0;
  }
}
