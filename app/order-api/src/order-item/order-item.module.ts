import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { OrderItemProfile } from './order-item.mapper';
import { Order } from 'src/order/order.entity';
import { Variant } from 'src/variant/variant.entity';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order, Variant]), DbModule],
  controllers: [OrderItemController],
  providers: [OrderItemService, OrderItemProfile],
  exports: [OrderItemService],
})
export class OrderItemModule {}
