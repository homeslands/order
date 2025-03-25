import { Module } from '@nestjs/common';
import { ChefOrderItemService } from './chef-order-item.service';
import { ChefOrderItemController } from './chef-order-item.controller';
import { ChefOrderItemProfile } from './chef-order-item.mapper';
import { ChefOrderItemUtils } from './chef-order-item.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChefOrderItem } from './chef-order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChefOrderItem])],
  controllers: [ChefOrderItemController],
  providers: [ChefOrderItemService, ChefOrderItemProfile, ChefOrderItemUtils],
  exports: [ChefOrderItemUtils],
})
export class ChefOrderItemModule {}
