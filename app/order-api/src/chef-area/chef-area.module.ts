import { Module } from '@nestjs/common';
import { ChefAreaService } from './chef-area.service';
import { ChefAreaController } from './chef-area.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChefArea } from './chef-area.entity';
import { ChefAreaProfile } from './chef-area.mapper';
import { ChefAreaUtils } from './chef-area.utils';
import { BranchUtils } from 'src/branch/branch.utils';
import { Branch } from 'src/branch/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChefArea, Branch])],
  controllers: [ChefAreaController],
  providers: [ChefAreaService, ChefAreaProfile, ChefAreaUtils, BranchUtils],
  exports: [ChefAreaUtils],
})
export class ChefAreaModule {}
