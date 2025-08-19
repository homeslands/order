import { Module } from '@nestjs/common';
import { ProductAnalysisService } from './product-analysis.service';
import { ProductAnalysisController } from './product-analysis.controller';
import { ProductAnalysisScheduler } from './product-analysis.scheduler';
import { ProductAnalysisProfile } from './product-analysis.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAnalysis } from './product-analysis.entity';
import { Branch } from 'src/branch/branch.entity';
import { Product } from 'src/product/product.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { DbModule } from 'src/db/db.module';
import { ProductAnalysisUtils } from './product-analysis.utils';
import { QueueRegisterKey } from 'src/app/app.constants';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductAnalysis,
      Branch,
      Product,
      MenuItem,
      Menu,
    ]),
    BullModule.registerQueue({
      name: QueueRegisterKey.DISTRIBUTE_LOCK_JOB,
    }),
    DbModule,
  ],
  controllers: [ProductAnalysisController],
  providers: [
    ProductAnalysisService,
    ProductAnalysisScheduler,
    ProductAnalysisProfile,
    ProductAnalysisUtils,
  ],
})
export class ProductAnalysisModule {}
