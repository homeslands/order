import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './promotion.entity';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { PromotionProfile } from './promotion.mapper';
import { Branch } from 'src/branch/branch.entity';
import { PromotionUtils } from './promotion.utils';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { ApplicablePromotionService } from 'src/applicable-promotion/applicable-promotion.service';
import { Product } from 'src/product/product.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { ApplicablePromotionUtils } from 'src/applicable-promotion/applicable-promotion.utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Promotion,
      Branch,
      ApplicablePromotion,
      Product,
      Menu,
      MenuItem,
    ]),
  ],
  controllers: [PromotionController],
  providers: [
    PromotionService,
    PromotionProfile,
    PromotionUtils,
    ApplicablePromotionService,
    ApplicablePromotionUtils,
  ],
  exports: [PromotionUtils],
})
export class PromotionModule {}
