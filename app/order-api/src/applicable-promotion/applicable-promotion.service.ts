import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicablePromotion } from "./applicable-promotion.entity";
import { DataSource, FindOptionsWhere, Repository } from "typeorm";
import { Promotion } from "src/promotion/promotion.entity";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ApplicablePromotionResponseDto, CreateApplicablePromotionRequestDto, CreateManyApplicablePromotionsRequestDto } from "./applicable-promotion.dto";
import { PromotionValidation } from "src/promotion/promotion.validation";
import { PromotionException } from "src/promotion/promotion.exception";
import { ApplicablePromotionType } from "./applicable-promotion.constant";
import { Product } from "src/product/product.entity";
import ProductValidation from "src/product/product.validation";
import { ProductException } from "src/product/product.exception";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { ApplicablePromotionUtils } from "./applicable-promotion.utils";
import { ApplicablePromotionValidation } from "./applicable-promotion.validation";
import { ApplicablePromotionException } from "./applicable-promotion.exception";
import { Menu } from "src/menu/menu.entity";
import { MenuItem } from "src/menu-item/menu-item.entity";
import { TransactionManagerService } from "src/db/transaction-manager.service";
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { ProductResponseDto } from "src/product/product.dto";

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

  // async createManyApplicablePromotions(
  //   createManyApplicablePromotionsRequestDto: CreateManyApplicablePromotionsRequestDto
  // ): Promise<ApplicablePromotionResponseDto[]> {
  //   const context = `${ApplicablePromotionService.name}.${this.createManyApplicablePromotions.name}`;

  //   const promotion = await this.promotionRepository.findOne({ 
  //     where: { slug: createManyApplicablePromotionsRequestDto.promotion },
  //     relations: ['branch']
  //   });
  //   if (!promotion) {
  //     this.logger.warn(PromotionValidation.PROMOTION_NOT_FOUND.message, context);
  //     throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
  //   }
  //   return;
  // }

  async createApplicablePromotion(
    createApplicablePromotionRequestDto: CreateApplicablePromotionRequestDto
  ): Promise<ApplicablePromotionResponseDto> {
    const context = `${ApplicablePromotionService.name}.${this.createApplicablePromotion.name}`;

    const promotion = await this.promotionRepository.findOne({ 
      where: { slug: createApplicablePromotionRequestDto.promotion },
      relations: ['branch']
    });
    if (!promotion) {
      this.logger.warn(PromotionValidation.PROMOTION_NOT_FOUND.message, context);
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    const product = await this.productRepository.findOneBy({
      slug: createApplicablePromotionRequestDto.applicableSlug
    });

    if (!product) {
      this.logger.warn(ProductValidation.PRODUCT_NOT_FOUND.message, context);
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    const applicablePromotionFindOptionsWhere: FindOptionsWhere<ApplicablePromotion> = {
      promotion: { id: promotion.id },
      applicableId: product.id
    };

    const applicablePromotion = 
      await this.applicablePromotionRepository.findOne({
        where: applicablePromotionFindOptionsWhere
      });
    
    if(applicablePromotion) {
      this.logger.warn(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_ALREADY_EXISTED.message,
        context
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_ALREADY_EXISTED
      );
    }

    const createApplicablePromotionData = this.mapper.map(
      createApplicablePromotionRequestDto,
      CreateApplicablePromotionRequestDto,
      ApplicablePromotion
    );

    Object.assign(createApplicablePromotionData, { promotion, applicableId: product.id });
    const newApplicablePromotion = this.applicablePromotionRepository.create(createApplicablePromotionData);

    const today = new Date();
    today.setHours(7,0,0,0); // start of today

    let updateMenuItem = null;
    if(today.getTime() >= (new Date(promotion.startDate)).getTime()) {
      // updateMenuItem = await this.addPromotionForMenuItem(
      //   today,
      //   promotion.branch.id,
      //   createApplicablePromotionRequestDto.applicableSlug,
      //   promotion
      // );
      updateMenuItem = await this.getMenuItemByApplicablePromotion(
        today,
        promotion.branch.id,
        product.id,
        promotion.value,
        promotion.id
      );
      console.log({ updateMenuItem });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdApplicablePromotion = await queryRunner.manager.save(newApplicablePromotion);
      if(updateMenuItem) {
        await queryRunner.manager.save(updateMenuItem);
      }
      
      await queryRunner.commitTransaction();
      this.logger.log(
        `Revenue ${new Date().toISOString()} created successfully`,
        context,
      );

      const product = await this.productRepository.findOneBy({ id: createdApplicablePromotion.applicableId });
      const productDto = this.mapper.map(product, Product, ProductResponseDto);
          
      const applicablePromotionDto = this.mapper.map(
        createdApplicablePromotion,
        ApplicablePromotion,
        ApplicablePromotionResponseDto
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
        ApplicablePromotionValidation.ERROR_WHEN_DELETE_APPLICABLE_PROMOTION,
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteApplicablePromotion(
    slug: string
  ): Promise<number> {
    const context = `${ApplicablePromotionService.name}.${this.deleteApplicablePromotion.name}`;

    const applicablePromotionFindOptionsWhere: FindOptionsWhere<ApplicablePromotion> = { slug };
    const applicablePromotion = 
      await this.applicablePromotionUtils.getApplicablePromotion(applicablePromotionFindOptionsWhere);

    if(!applicablePromotion) {
      this.logger.warn(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_NOT_FOUND.message,
        context
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_NOT_FOUND
      );
    }

    const promotionFindOptionsWhere: FindOptionsWhere<Promotion> = { 
      applicablePromotions: { id: applicablePromotion.id }
    };
    const promotion = await this.promotionUtils.getPromotion(promotionFindOptionsWhere, ['branch']);

    const today = new Date();
    today.setHours(7,0,0,0);

    // const menuItem = await this.removePromotionInMenuItem(
    //   promotion.branch.id,
    //   applicablePromotion.applicableId
    // );

    const menuItem = await this.getMenuItemByApplicablePromotion(
      today,
      promotion.branch.id,
      applicablePromotion.applicableId,
      0,
      null
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deleted = await queryRunner.manager.softDelete(ApplicablePromotion, { id: applicablePromotion.id } );
      if(menuItem) {
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

  async getMenuItemByApplicablePromotion(
    date: Date,
    branchId: string,
    productId: string,
    updateValue: number,
    updatePromotionId: string
  ): Promise<MenuItem> {
    const context = `${ApplicablePromotionService.name}.${this.getMenuItemByApplicablePromotion.name}`;

    try {
      const menu = await this.menuRepository.findOne({
        where: {
          branch: { id: branchId },
          date
        },
        relations: ['menuItems.product'],
      });
      console.log({ menu: menu });
      if(!menu) return null;
  
      const menuItem = await this.menuItemRepository.findOne({
        where: {
          menu: { id: menu.id },
          product: { id: productId }
        }
      });
      console.log({ menuItem: menuItem });
      if(!menuItem) return null;
  
      Object.assign(menuItem, {
        promotionValue: updateValue,
        promotionId: updatePromotionId
      });
  
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
}