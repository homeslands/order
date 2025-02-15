import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Branch } from 'src/branch/branch.entity';
import { MenuProfile } from './menu.mapper';
import { MenuScheduler } from './menu.scheduler';
import { MenuSubscriber } from './menu.subscriber';
import { MenuUtils } from './menu.utils';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';

@Module({
  imports: [TypeOrmModule.forFeature([
    Menu, 
    Branch,
    ApplicablePromotion,
    Promotion
  ])],
  controllers: [MenuController],
  providers: [
    MenuService,
    MenuProfile,
    MenuScheduler,
    MenuSubscriber,
    MenuUtils,
    PromotionUtils
  ],
  exports: [MenuService, MenuUtils],
})
export class MenuModule {}
