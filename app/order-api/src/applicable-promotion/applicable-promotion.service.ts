import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicablePromotion } from './applicable-promotion.entity';
import {
  DataSource,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Promotion } from 'src/promotion/promotion.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  ApplicablePromotionResponseDto,
  CreateApplicablePromotionRequestDto,
  CreateManyApplicablePromotionsRequestDto,
  GetSpecificApplicablePromotionRequestDto,
} from './applicable-promotion.dto';
import { PromotionValidation } from 'src/promotion/promotion.validation';
import { PromotionException } from 'src/promotion/promotion.exception';
import { ApplicablePromotionType } from './applicable-promotion.constant';
import { Product } from 'src/product/product.entity';
import ProductValidation from 'src/product/product.validation';
import { ProductException } from 'src/product/product.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ApplicablePromotionUtils } from './applicable-promotion.utils';
import { ApplicablePromotionValidation } from './applicable-promotion.validation';
import { ApplicablePromotionException } from './applicable-promotion.exception';
import { Menu } from 'src/menu/menu.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { ProductResponseDto } from 'src/product/product.dto';
import * as _ from 'lodash';

@Injectable()
export class ApplicablePromotionService {
  constructor(
    @InjectRepository(ApplicablePromotion)
    private readonly applicablePromotionRepository: Repository<ApplicablePromotion>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly applicablePromotionUtils: ApplicablePromotionUtils,
    private readonly promotionUtils: PromotionUtils,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create many applicable promotions
   * @param {CreateManyApplicablePromotionsRequestDto} createManyApplicablePromotionsRequestDto The request data to create many applicable promotions
   * @returns {Promise<ApplicablePromotionResponseDto[]>} The applicable promotion data
   * @throws {PromotionException} Throw if promotion not found
   * @throws {ProductException} Throw if product not found
   * @throws {ApplicablePromotionException} Throw if applicable promotion already existed
   */
  async createManyApplicablePromotions(
    createManyApplicablePromotionsRequestDto: CreateManyApplicablePromotionsRequestDto,
  ): Promise<ApplicablePromotionResponseDto[]> {
    const context = `${ApplicablePromotionService.name}.${this.createManyApplicablePromotions.name}`;

    const promotion = await this.promotionRepository.findOne({
      where: { slug: createManyApplicablePromotionsRequestDto.promotion },
      relations: ['branch'],
    });
    if (!promotion) {
      this.logger.warn(
        PromotionValidation.PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    const constructApplicablePromotions = await Promise.all(
      createManyApplicablePromotionsRequestDto.applicableSlugs.map(
        async (applicableSlug) => {
          return await this.constructApplicablePromotion(
            promotion,
            createManyApplicablePromotionsRequestDto,
            applicableSlug,
          );
        },
      ),
    );

    const createApplicablePromotions = constructApplicablePromotions.map(
      (constructApplicablePromotion) =>
        constructApplicablePromotion.createManyApplicablePromotionsData,
    );
    const updateMenuItems = constructApplicablePromotions
      .map((promotion) => promotion.updateMenuItem)
      .filter(Boolean); // Remove null & undefined

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdApplicablePromotions = await queryRunner.manager.save(
        createApplicablePromotions,
      );
      await queryRunner.manager.save(updateMenuItems);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue ${new Date().toISOString()} created successfully`,
        context,
      );

      // const product = await this.productRepository.findOneBy({ id: createdApplicablePromotion.applicableId });
      // const productDto = this.mapper.map(product, Product, ProductResponseDto);

      const applicablePromotionDtos = this.mapper.mapArray(
        createdApplicablePromotions,
        ApplicablePromotion,
        ApplicablePromotionResponseDto,
      );

      // Object.assign(applicablePromotionDto, { applicableObject: productDto });

      return applicablePromotionDtos;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `An error occurred while create many applicable promotions: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.ERROR_WHEN_CREATE_APPLICABLE_PROMOTION,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create applicable promotion
   * @param {CreateApplicablePromotionRequestDto} createApplicablePromotionRequestDto The request data to create applicable promotion
   * @returns {Promise<ApplicablePromotionResponseDto>} The applicable promotion data
   * @throws {PromotionException} Throw if promotion not found
   * @throws {ProductException} Throw if product not found
   * @throws {ApplicablePromotionException} Throw if applicable promotion already existed
   */
  async createApplicablePromotion(
    createApplicablePromotionRequestDto: CreateApplicablePromotionRequestDto,
  ): Promise<ApplicablePromotionResponseDto> {
    const context = `${ApplicablePromotionService.name}.${this.createApplicablePromotion.name}`;

    const promotion = await this.promotionRepository.findOne({
      where: { slug: createApplicablePromotionRequestDto.promotion },
      relations: ['branch'],
    });
    if (!promotion) {
      this.logger.warn(
        PromotionValidation.PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    const product = await this.productRepository.findOneBy({
      slug: createApplicablePromotionRequestDto.applicableSlug,
    });

    if (!product) {
      this.logger.warn(ProductValidation.PRODUCT_NOT_FOUND.message, context);
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    const applicablePromotionFindOptionsWhere: FindOptionsWhere<ApplicablePromotion> =
      {
        promotion: { id: promotion.id },
        applicableId: product.id,
      };

    const applicablePromotion =
      await this.applicablePromotionRepository.findOne({
        where: applicablePromotionFindOptionsWhere,
      });

    if (applicablePromotion) {
      this.logger.warn(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_ALREADY_EXISTED
          .message,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_ALREADY_EXISTED,
      );
    }

    const createApplicablePromotionData = this.mapper.map(
      createApplicablePromotionRequestDto,
      CreateApplicablePromotionRequestDto,
      ApplicablePromotion,
    );

    Object.assign(createApplicablePromotionData, {
      promotion,
      applicableId: product.id,
    });

    const today = new Date();
    today.setHours(7, 0, 0, 0); // start of today

    let updateMenuItem = null;
    if (today.getTime() >= new Date(promotion.startDate).getTime()) {
      updateMenuItem = await this.getMenuItemByApplicablePromotion(
        today,
        promotion.branch.id,
        product.id,
        promotion,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdApplicablePromotion = await queryRunner.manager.save(
        createApplicablePromotionData,
      );
      if (updateMenuItem) {
        await queryRunner.manager.save(updateMenuItem);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue ${new Date().toISOString()} created successfully`,
        context,
      );

      const product = await this.productRepository.findOneBy({
        id: createdApplicablePromotion.applicableId,
      });
      const productDto = this.mapper.map(product, Product, ProductResponseDto);

      const applicablePromotionDto = this.mapper.map(
        createdApplicablePromotion,
        ApplicablePromotion,
        ApplicablePromotionResponseDto,
      );
      Object.assign(applicablePromotionDto, { applicableObject: productDto });

      return applicablePromotionDto;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `An error occurred while create applicable promotion: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.ERROR_WHEN_CREATE_APPLICABLE_PROMOTION,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Construct applicable promotion
   * @param {Promotion} promotion The promotion is applied
   * @param {CreateApplicablePromotionRequestDto} createManyApplicablePromotionsRequestDto The request data to create applicable promotion
   * @param {string} productSlug The product slug
   * @returns {Promise<{ createManyApplicablePromotionsData: CreateManyApplicablePromotionsRequestDto, updateMenuItem: MenuItem }>} The applicable promotion data
   * @throws {ProductException} Throw if product not found
   * @throws {ApplicablePromotionException} Throw if applicable promotion already existed
   */
  async constructApplicablePromotion(
    promotion: Promotion,
    createManyApplicablePromotionsRequestDto: CreateManyApplicablePromotionsRequestDto,
    productSlug: string,
  ) {
    const context = `${ApplicablePromotionService.name}.${this.constructApplicablePromotion.name}`;

    const createManyApplicablePromotionsData = this.mapper.map(
      createManyApplicablePromotionsRequestDto,
      CreateManyApplicablePromotionsRequestDto,
      ApplicablePromotion,
    );

    const product = await this.productRepository.findOneBy({
      slug: productSlug,
    });

    if (!product) {
      this.logger.warn(ProductValidation.PRODUCT_NOT_FOUND.message, context);
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    const applicablePromotionFindOptionsWhere: FindOptionsWhere<ApplicablePromotion> =
      {
        promotion: { id: promotion.id },
        applicableId: product.id,
      };

    const applicablePromotion =
      await this.applicablePromotionRepository.findOne({
        where: applicablePromotionFindOptionsWhere,
      });

    if (applicablePromotion) {
      this.logger.warn(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_ALREADY_EXISTED
          .message,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_ALREADY_EXISTED,
      );
    }

    Object.assign(createManyApplicablePromotionsData, {
      promotion,
      applicableId: product.id,
    });

    const today = new Date();
    today.setHours(7, 0, 0, 0); // start of today

    let updateMenuItem = null;
    if (today.getTime() >= new Date(promotion.startDate).getTime()) {
      updateMenuItem = await this.getMenuItemByApplicablePromotion(
        today,
        promotion.branch.id,
        product.id,
        promotion,
      );
    }

    return { createManyApplicablePromotionsData, updateMenuItem };
  }

  /**
   * Delete applicable promotion
   * @param {string} slug The slug of applicable promotion
   * @returns Promise<number> The number of affected to be deleted
   * @throws {ApplicablePromotionException} Throw if applicable promotion not found
   */
  async deleteApplicablePromotion(slug: string): Promise<number> {
    const context = `${ApplicablePromotionService.name}.${this.deleteApplicablePromotion.name}`;

    const applicablePromotionFindOptionsWhere: FindOptionsWhere<ApplicablePromotion> =
      { slug };
    const applicablePromotion =
      await this.applicablePromotionUtils.getApplicablePromotion(
        applicablePromotionFindOptionsWhere,
      );

    if (!applicablePromotion) {
      this.logger.warn(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_NOT_FOUND,
      );
    }

    const promotion = await this.promotionUtils.getPromotion({
      where: {
        applicablePromotions: { id: applicablePromotion.id },
      },
      relations: ['branch'],
    });

    const today = new Date();
    today.setHours(7, 0, 0, 0);

    const menuItem = await this.getMenuItemByApplicablePromotionWhenDelete(
      today,
      promotion.branch.id,
      applicablePromotion.applicableId,
      applicablePromotion,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deleted = await queryRunner.manager.softDelete(
        ApplicablePromotion,
        { id: applicablePromotion.id },
      );
      if (menuItem) {
        await queryRunner.manager.save(menuItem);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue ${new Date().toISOString()} created successfully`,
        context,
      );
      return deleted.affected || 0;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `An error occurred while delete applicable promotion: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.ERROR_WHEN_DELETE_APPLICABLE_PROMOTION,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get menu item by applicable promotion
   * @param {Date} date The date of menu
   * @param {string} branchId The branch id
   * @param {string} productId The product id
   * @param {Promotion} promotion The promotion is applied
   * @returns {Promise<MenuItem>} The menu item
   * @throws {ApplicablePromotionException} Throw if get menu item by applicable promotion failed
   */
  async getMenuItemByApplicablePromotion(
    date: Date,
    branchId: string,
    productId: string,
    promotion: Promotion,
  ): Promise<MenuItem> {
    const context = `${ApplicablePromotionService.name}.${this.getMenuItemByApplicablePromotion.name}`;

    try {
      const menu = await this.menuRepository.findOne({
        where: {
          branch: { id: branchId },
          date,
        },
        relations: ['menuItems.product'],
      });
      if (!menu) return null;

      const menuItem = await this.menuItemRepository.findOne({
        where: {
          menu: { id: menu.id },
          product: { id: productId },
        },
      });
      if (!menuItem) return null;

      Object.assign(menuItem, { promotion });

      return menuItem;
    } catch (error) {
      this.logger.error(
        `An error occurred while get menu item by applicable promotion: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.ERROR_WHEN_GET_MENU_ITEM_BY_APPLICABLE_PROMOTION,
      );
    }
  }

  /**
   * Get menu item by applicable promotion when delete
   * @param {Date} date
   * @param {string} branchId
   * @param {string} productId
   * @param {ApplicablePromotion} deletedApplicablePromotion
   * @returns {Promise<MenuItem>}
   * @throws {ApplicablePromotionException} Throw if get menu item by applicable promotion failed
   */
  async getMenuItemByApplicablePromotionWhenDelete(
    date: Date,
    branchId: string,
    productId: string,
    deletedApplicablePromotion: ApplicablePromotion,
  ): Promise<MenuItem> {
    const context = `${ApplicablePromotionService.name}.${this.getMenuItemByApplicablePromotionWhenDelete.name}`;

    try {
      const menu = await this.menuRepository.findOne({
        where: {
          branch: { id: branchId },
          date,
        },
        relations: ['menuItems.product'],
      });
      if (!menu) return null;

      const menuItem = await this.menuItemRepository.findOne({
        where: {
          menu: { id: menu.id },
          product: { id: productId },
        },
      });
      if (!menuItem) return null;

      // The case: delete applicable promotion
      // - Delete current promotion
      // - Find other promotion if have
      // - If not found, set promotion to null
      const applicablePromotions =
        await this.applicablePromotionRepository.find({
          where: {
            type: ApplicablePromotionType.PRODUCT,
            applicableId: productId,
          },
          relations: ['promotion'],
        });

      const promotions = await Promise.allSettled(
        applicablePromotions.map(async (applicablePromotion) => {
          const promotion = await this.promotionRepository.findOne({
            where: {
              id: applicablePromotion.promotion.id,
              branch: {
                id: branchId,
              },
              startDate: LessThanOrEqual(date),
              endDate: MoreThanOrEqual(date),
            },
          });
          return promotion;
        }),
      );

      const successfulPromotions = promotions
        .filter((p) => p.status === 'fulfilled')
        .map((p) => p.value);

      const successfulPromotionsNotNull = successfulPromotions.filter(
        (p) => p !== null && p.id !== deletedApplicablePromotion.promotion.id,
      );

      if (_.isEmpty(successfulPromotionsNotNull)) return null;

      const maxPromotion = successfulPromotionsNotNull.reduce(
        (max, obj) => (obj.value > max.value ? obj : max),
        _.first(successfulPromotionsNotNull),
      );

      Object.assign(menuItem, { promotion: maxPromotion });
      return menuItem;
    } catch (error) {
      this.logger.error(
        `An error occurred while get menu item by applicable promotion: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.ERROR_WHEN_GET_MENU_ITEM_BY_APPLICABLE_PROMOTION,
      );
    }
  }

  /**
   * Get specific applicable promotion
   * @param {GetSpecificApplicablePromotionRequestDto} requestData
   * @returns { Promise<ApplicablePromotionResponseDto>}
   */
  async getSpecificApplicablePromotion(
    requestData: GetSpecificApplicablePromotionRequestDto,
  ): Promise<ApplicablePromotionResponseDto> {
    const context = `${ApplicablePromotionService.name}.${this.getSpecificApplicablePromotion.name}`;

    const where: FindOptionsWhere<ApplicablePromotion> = {};
    const product = await this.productRepository.findOne({
      where: { slug: requestData.applicableSlug },
    });

    if (!product) {
      this.logger.warn(ProductValidation.PRODUCT_NOT_FOUND.message, context);
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    const promotion = await this.promotionRepository.findOne({
      where: { slug: requestData.promotion },
    });
    if (!promotion) {
      this.logger.warn(
        PromotionValidation.PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    where.promotion = { id: promotion.id };
    where.applicableId = product.id;

    this.logger.log(where, context);
    // if (requestData.promotion && requestData.applicableSlug) {
    //   const product = await this.productRepository.findOne({
    //     where: { slug: requestData.applicableSlug },
    //   });

    //   if (!product) {
    //     this.logger.warn(ProductValidation.PRODUCT_NOT_FOUND.message, context);
    //     throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    //   }

    //   const promotion = await this.promotionRepository.findOne({
    //     where: { slug: requestData.promotion },
    //   });
    //   if (!promotion) {
    //     this.logger.warn(
    //       PromotionValidation.PROMOTION_NOT_FOUND.message,
    //       context,
    //     );
    //     throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    //   }

    //   where.promotion = promotion;
    //   where.applicableId = product.id;
    // } else {
    //   this.logger.warn(
    //     ApplicablePromotionValidation
    //       .MUST_HAVE_BOTH_PROMOTION_SLUG_AND_APPLICABLE_SLUG.message,
    //     context,
    //   );
    //   throw new ApplicablePromotionException(
    //     ApplicablePromotionValidation.MUST_HAVE_BOTH_PROMOTION_SLUG_AND_APPLICABLE_SLUG,
    //   );
    // }

    const applicablePromotion =
      await this.applicablePromotionUtils.getApplicablePromotion(where);

    const productDto = this.mapper.map(product, Product, ProductResponseDto);

    const applicablePromotionDto = this.mapper.map(
      applicablePromotion,
      ApplicablePromotion,
      ApplicablePromotionResponseDto,
    );
    applicablePromotionDto.applicableObject = productDto;
    return applicablePromotionDto;
  }
}
