import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Promotion } from "./promotion.entity";
import { PromotionController } from "./promotion.controller";
import { PromotionService } from "./promotion.service";
import { PromotionProfile } from "./promotion.mapper";
import { Branch } from "src/branch/branch.entity";
import { PromotionUtils } from "./promotion.utils";

@Module({
  imports: [TypeOrmModule.forFeature([
    Promotion,
    Branch
  ])],
  controllers: [PromotionController],
  providers: [
    PromotionService,
    PromotionProfile,
    PromotionUtils
  ],
  exports: [PromotionUtils]
})
export class PromotionModule {}