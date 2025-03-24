import { Module } from '@nestjs/common';
import { ChefOrderItemService } from './chef-order-item.service';
import { ChefOrderItemController } from './chef-order-item.controller';
import { ChefOrderItemProfile } from './chef-order-item.mapper';

@Module({
  controllers: [ChefOrderItemController],
  providers: [ChefOrderItemService, ChefOrderItemProfile],
})
export class ChefOrderItemModule {}
