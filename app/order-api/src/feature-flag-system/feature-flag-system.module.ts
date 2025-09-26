import { Module } from '@nestjs/common';
import { FeatureFlagSystemService } from './feature-flag-system.service';
import { FeatureFlagSystemController } from './feature-flag-system.controller';
import { FeatureFlagSystem } from './entities/feature-flag-system.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlagSystemScheduler } from './feature-flag-system.scheduler';
import { FeatureSystemGroup } from './entities/feature-system-group.entity';
import { DbModule } from 'src/db/db.module';
import { FeatureFlagSystemProfile } from './feature-flag-system.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlagSystem, FeatureSystemGroup]),
    DbModule,
  ],
  controllers: [FeatureFlagSystemController],
  providers: [
    FeatureFlagSystemService,
    FeatureFlagSystemScheduler,
    FeatureFlagSystemProfile,
  ],
  exports: [FeatureFlagSystemService],
})
export class FeatureFlagSystemModule {}
