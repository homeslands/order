import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingOrderItemController } from './tracking-order-item.controller';
import { TrackingOrderItemService } from './tracking-order-item.service';
import { TrackingOrderItem } from './tracking-order-item.entity';
import { TrackingOrderItemProfile } from './tracking-order-item.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingOrderItem])],
  controllers: [TrackingOrderItemController],
  providers: [TrackingOrderItemService, TrackingOrderItemProfile],
})
export class TrackingOrderItemModule {}
