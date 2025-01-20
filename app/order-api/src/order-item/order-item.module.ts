import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { OrderItemProfile } from './order-item.mapper';
import { Order } from 'src/order/order.entity';
import { Variant } from 'src/variant/variant.entity';
import { DbModule } from 'src/db/db.module';
import { OrderItemUtils } from './order-item.utils';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, Order, Variant]),
    DbModule,
    OrderModule,
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService, OrderItemProfile, OrderItemUtils],
  exports: [OrderItemService, OrderItemUtils],
})
export class OrderItemModule {}
