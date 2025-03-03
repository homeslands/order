import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { OrderItemProfile } from './order-item.mapper';
import { Order } from 'src/order/order.entity';
import { DbModule } from 'src/db/db.module';
import { OrderItemUtils } from './order-item.utils';
import { OrderModule } from 'src/order/order.module';
import { VariantModule } from 'src/variant/variant.module';
import { MenuItemModule } from 'src/menu-item/menu-item.module';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderItem,
      Order,
      Promotion,
      ApplicablePromotion,
      Menu,
    ]),
    DbModule,
    OrderModule,
    VariantModule,
    MenuItemModule,
  ],
  controllers: [OrderItemController],
  providers: [
    OrderItemService,
    OrderItemProfile,
    OrderItemUtils,
    PromotionUtils,
    MenuUtils,
  ],
  exports: [OrderItemService, OrderItemUtils],
})
export class OrderItemModule {}
