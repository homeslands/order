import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Promotion } from './promotion.entity';
import { PromotionValidation } from './promotion.validation';
import { PromotionException } from './promotion.exception';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { ApplicablePromotionType } from 'src/applicable-promotion/applicable-promotion.constant';
import * as _ from 'lodash';
import { MenuItem } from 'src/menu-item/menu-item.entity';

@Injectable()
export class PromotionUtils {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(ApplicablePromotion)
    private readonly applicablePromotionRepository: Repository<ApplicablePromotion>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getPromotion(options: FindOneOptions<Promotion>): Promise<Promotion> {
    const context = `${PromotionUtils.name}.${this.getPromotion.name}`;
    const promotion = await this.promotionRepository.findOne({
      relations: ['applicablePromotions', 'branch'],
      ...options,
    });
    if (!promotion) {
      this.logger.warn(
        PromotionValidation.PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }
    return promotion;
  }

  async getPromotionByProductAndBranch(
    date: Date,
    branchId: string,
    productId: string,
  ): Promise<Promotion> {
    const context = `${PromotionUtils.name}.${this.getPromotionByProductAndBranch.name}`;
    this.logger.log(`Get promotion from menu item`, context);

    const applicablePromotions = await this.applicablePromotionRepository.find({
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
      (p) => p !== null,
    );
    if (_.isEmpty(successfulPromotionsNotNull)) return null;

    const maxPromotion = successfulPromotionsNotNull.reduce(
      (max, obj) => (obj.value > max.value ? obj : max),
      _.first(successfulPromotionsNotNull),
    );

    return maxPromotion;
  }

  async validatePromotionWithMenuItem(
    promotionSlug: string,
    menuItem: MenuItem,
  ) {
    const context = `${PromotionUtils.name}.${this.validatePromotionWithMenuItem.name}`;

    if (promotionSlug) {
      const promotion = await this.getPromotion({
        where: {
          slug: promotionSlug,
        },
      });

      if (promotion.id !== menuItem.promotion?.id) {
        this.logger.warn(
          PromotionValidation.ERROR_WHEN_VALIDATE_PROMOTION.message,
          context,
        );
        throw new PromotionException(
          PromotionValidation.ERROR_WHEN_VALIDATE_PROMOTION,
        );
      }
    } else {
      if (menuItem.promotion) {
        this.logger.warn(
          PromotionValidation.ERROR_WHEN_VALIDATE_PROMOTION.message,
          context,
        );
        throw new PromotionException(
          PromotionValidation.ERROR_WHEN_VALIDATE_PROMOTION,
        );
      }
    }
  }
}
