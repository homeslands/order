import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Promotion } from "./promotion.entity";
import { Repository } from "typeorm";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { CreatePromotionRequestDto, PromotionResponseDto, UpdatePromotionRequestDto } from "./promotion.dto";
import { Branch } from "src/branch/branch.entity";
import { BranchException } from "src/branch/branch.exception";
import { BranchValidation } from "src/branch/branch.validation";
import { PromotionException } from "./promotion.exception";
import { PromotionValidation } from "./promotion.validation";
import * as _ from 'lodash';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async createPromotion(
    branchSlug: string,
    createPromotionRequestDto: CreatePromotionRequestDto
  ): Promise<PromotionResponseDto> {
    const context = `${PromotionService.name}.${this.createPromotion.name}`;

    console.log('branchSlug', branchSlug);

    const branch = await this.branchRepository.findOneBy({ slug: branchSlug });
    console.log('branch', branch);
    if (!branch) {
      this.logger.warn(BranchValidation.BRANCH_NOT_FOUND.message, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    const promotionData = this.mapper.map(
      createPromotionRequestDto,
      CreatePromotionRequestDto,
      Promotion,
    );

    Object.assign(promotionData, { branch });
    const newPromotion = this.promotionRepository.create(promotionData);
    const createdPromotion = await this.promotionRepository.save(newPromotion);

    this.logger.log(
      `Promotion ${createdPromotion.id} created successfully`,
      context
    );
    const promotionDto = this.mapper.map(
      createdPromotion,
      Promotion,
      PromotionResponseDto
    );
    return promotionDto;
  }

  async getAllPromotions(branchSlug: string): Promise<PromotionResponseDto[]> {
    const context = `${PromotionService.name}.${this.getAllPromotions.name}`;

    const branch = await this.branchRepository.findOneBy({ slug: branchSlug });
    if (!branch) {
      this.logger.warn(BranchValidation.BRANCH_NOT_FOUND.message, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    const promotions = await this.promotionRepository.find({
      where: { 
        branch: { slug: branchSlug } 
      },
    });

    const promotionDtos = this.mapper.mapArray(
      promotions,
      Promotion,
      PromotionResponseDto
    );

    return promotionDtos;
  }

  async updatePromotion(
    slug: string,
    updatePromotionRequestDto: UpdatePromotionRequestDto
  ): Promise<PromotionResponseDto> {
    const context = `${PromotionService.name}.${this.updatePromotion.name}`;

    const promotion = await this.promotionRepository.findOneBy({ slug });
    if(!promotion) {
      this.logger.warn(PromotionValidation.PROMOTION_NOT_FOUND.message, context);
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    console.log('updatePromotionRequestDto', updatePromotionRequestDto);

    const branch = await this.branchRepository.findOneBy({ slug: updatePromotionRequestDto.branch });
    if (!branch) {
      this.logger.warn(BranchValidation.BRANCH_NOT_FOUND.message, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    const promotionData = this.mapper.map(
      updatePromotionRequestDto,
      UpdatePromotionRequestDto,
      Promotion,
    );
    Object.assign(promotion, { ...promotionData, branch });

    const updatedPromotion = await this.promotionRepository.save(promotion);

    this.logger.log(
      `Promotion ${updatedPromotion.id} updated successfully`,
      context
    );
    const promotionDto = this.mapper.map(
      updatedPromotion,
      Promotion,
      PromotionResponseDto
    );
    return promotionDto;
  }

  async deletePromotion(slug: string): Promise<number> {
    const context = `${PromotionService.name}.${this.deletePromotion.name}`;

    const promotion = await this.promotionRepository.findOne({
      where: { slug },
      relations: ['applicablePromotions']
     });
    if(!promotion) {
      this.logger.warn(PromotionValidation.PROMOTION_NOT_FOUND.message, context);
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    if(!_.isEmpty(promotion.applicablePromotions)) {
      this.logger.warn(PromotionValidation.DENY_DELETE_PROMOTION.message, context);
      throw new PromotionException(PromotionValidation.DENY_DELETE_PROMOTION);
    }

    const deleted = await this.promotionRepository.delete({ id: promotion.id });

    this.logger.log(
      `Promotion ${promotion.id} deleted successfully`,
      context
    );
    return deleted.affected;
  }
}