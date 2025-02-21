import { Module } from "@nestjs/common";
import { ApplicablePromotion } from "./applicable-promotion.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicablePromotionController } from "./applicable-promotion.controller";
import { ApplicablePromotionService } from "./applicable-promotion.service";
import { ApplicablePromotionProfile } from "./applicable-promotion.mapper";
import { Promotion } from "src/promotion/promotion.entity";
import { Product } from "src/product/product.entity";
import { ApplicablePromotionUtils } from "./applicable-promotion.utils";
import { Menu } from "src/menu/menu.entity";
import { MenuItem } from "src/menu-item/menu-item.entity";
import { DbModule } from 'src/db/db.module';
import { PromotionUtils } from "src/promotion/promotion.utils";


@Module({
  imports: [TypeOrmModule.forFeature([
    ApplicablePromotion,
    Promotion,
    Product,
    Menu,
    MenuItem
  ]),
],
  controllers: [ApplicablePromotionController],
  providers: [
    ApplicablePromotionService,
    ApplicablePromotionProfile,
    ApplicablePromotionUtils,
    PromotionUtils
  ],
  exports: [
    ApplicablePromotionUtils,
    ApplicablePromotionService
  ]
})
export class ApplicablePromotionModule {}