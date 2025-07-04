import { Module } from '@nestjs/common';
import { ChefOrderItemService } from './chef-order-item.service';
import { ChefOrderItemController } from './chef-order-item.controller';
import { ChefOrderItemProfile } from './chef-order-item.mapper';
import { ChefOrderItemUtils } from './chef-order-item.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChefOrderItem } from './chef-order-item.entity';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { Order } from 'src/order/order.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { User } from 'src/user/user.entity';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChefOrderItem,
      Order,
      ChefArea,
      Product,
      ChefOrder,
      User,
    ]),
    NotificationModule,
    DbModule,
  ],
  controllers: [ChefOrderItemController],
  providers: [
    ChefOrderItemService,
    ChefOrderItemProfile,
    ChefOrderItemUtils,
    ChefOrderUtils,
  ],
  exports: [ChefOrderItemUtils],
})
export class ChefOrderItemModule {}
