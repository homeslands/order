import { Module } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueController } from './revenue.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revenue } from './revenue.entity';
import { RevenueProfile } from './revenue.mapper';
import { RevenueScheduler } from './revenue.scheduler';
import { DbModule } from 'src/db/db.module';
import { BranchRevenue } from 'src/branch-revenue/branch-revenue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Revenue, BranchRevenue]), DbModule],
  controllers: [RevenueController],
  providers: [RevenueService, RevenueProfile, RevenueScheduler],
})
export class RevenueModule {}
