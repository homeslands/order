import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ApplicablePromotion } from './applicable-promotion.entity';
import { ApplicablePromotionException } from './applicable-promotion.exception';
import { ApplicablePromotionValidation } from './applicable-promotion.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ApplicablePromotionUtils {
  constructor(
    @InjectRepository(ApplicablePromotion)
    private readonly applicablePromotionRepository: Repository<ApplicablePromotion>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getApplicablePromotion(
    where: FindOptionsWhere<ApplicablePromotion>,
  ): Promise<ApplicablePromotion> {
    const context = `${ApplicablePromotionUtils.name}.${this.getApplicablePromotion.name}`;

    const applicablePromotion =
      await this.applicablePromotionRepository.findOne({
        where,
        relations: ['promotion'],
      });
    if (!applicablePromotion) {
      this.logger.warn(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new ApplicablePromotionException(
        ApplicablePromotionValidation.APPLICABLE_PROMOTION_NOT_FOUND,
      );
    }
    return applicablePromotion;
  }
}
