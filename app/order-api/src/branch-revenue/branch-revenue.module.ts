import { Module } from '@nestjs/common';
import { BranchRevenueController } from './branch-revenue.controller';
import { BranchRevenueService } from './branch-revenue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { BranchRevenue } from './branch-revenue.entity';
import { BranchRevenueScheduler } from './branch-revenue.scheduler';
import { BranchRevenueProfile } from './branch-revenue.mapper';
import { DbModule } from 'src/db/db.module';
import { BranchUtils } from 'src/branch/branch.utils';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/file.entity';
import { PdfService } from 'src/pdf/pdf.service';
@Module({
  imports: [TypeOrmModule.forFeature([Branch, BranchRevenue, File]), DbModule],
  controllers: [BranchRevenueController],
  providers: [
    BranchRevenueService,
    BranchRevenueScheduler,
    BranchRevenueProfile,
    BranchUtils,
    FileService,
    PdfService,
  ],
  exports: [BranchRevenueService],
})
export class BranchRevenueModule {}
