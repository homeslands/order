import { Module } from '@nestjs/common';
import { BranchConfigService } from './branch-config.service';
import { BranchConfigController } from './branch-config.controller';
import { BranchConfigProfile } from './branch-config.mapper';
import { BranchConfig } from './branch-config.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchConfig, Branch])],
  controllers: [BranchConfigController],
  providers: [BranchConfigService, BranchConfigProfile],
  exports: [BranchConfigService],
})
export class BranchConfigModule {}
