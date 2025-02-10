import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Promotion } from './promotion.entity';
import { PromotionValidation } from './promotion.validation';
import { PromotionException } from './promotion.exception';

@Injectable()
export class PromotionUtils {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getPromotion(
    where: FindOptionsWhere<Promotion>,
    relations?: string[]
  ): Promise<Promotion> {
    const context = `${PromotionUtils.name}.${this.getPromotion.name}`;

    const promotion = await this.promotionRepository.findOne({ where, relations });
    if (!promotion) {
      this.logger.warn(
        PromotionValidation.PROMOTION_NOT_FOUND.message, 
        context
      );
      throw new PromotionException(
        PromotionValidation.PROMOTION_NOT_FOUND
      );
    } 
    return promotion;
  }
}
