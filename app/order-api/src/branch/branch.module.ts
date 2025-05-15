import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { BranchProfile } from './branch.mapper';
import { BranchScheduler } from './branch.scheduler';
import { BranchUtils } from './branch.utils';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), DbModule],
  controllers: [BranchController],
  providers: [BranchService, BranchProfile, BranchScheduler, BranchUtils],
  exports: [BranchUtils],
})
export class BranchModule {}
