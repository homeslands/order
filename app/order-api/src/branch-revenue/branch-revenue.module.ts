import { Module } from '@nestjs/common';
import { BranchRevenueController } from './branch-revenue.controller';
import { BranchRevenueService } from './branch-revenue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { BranchRevenue } from './branch-revenue.entity';
import { BranchRevenueScheduler } from './branch-revenue.scheduler';
import { BranchRevenueProfile } from './branch-revenue.mapper';
import { DbModule } from 'src/db/db.module';
import { Payment } from 'src/payment/payment.entity';
import { Order } from 'src/order/order.entity';
import { OrderItem } from 'src/order-item/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      BranchRevenue,
      Payment,
      Order,
      OrderItem,
    ]),
    DbModule,
  ],
  controllers: [BranchRevenueController],
  providers: [
    BranchRevenueService,
    BranchRevenueScheduler,
    BranchRevenueProfile,
  ],
  exports: [BranchRevenueService],
})
export class BranchRevenueModule {}
