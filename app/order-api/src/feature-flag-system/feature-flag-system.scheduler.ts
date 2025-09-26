import { Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureSystemGroup } from './entities/feature-system-group.entity';
import { FeatureFlagSystem } from './entities/feature-flag-system.entity';
import {
  FeatureFlagSystems,
  FeatureSystemGroups,
} from './feature-flag-system.constant';

@Injectable()
export class FeatureFlagSystemScheduler {
  private readonly logger = new Logger(FeatureFlagSystemScheduler.name);

  constructor(
    @InjectRepository(FeatureSystemGroup)
    private groupRepo: Repository<FeatureSystemGroup>,
    @InjectRepository(FeatureFlagSystem)
    private featureRepo: Repository<FeatureFlagSystem>,
  ) {}

  @Timeout(1000)
  async syncFeatureFlags() {
    this.logger.log('Starting feature flag sync...');

    let orderGroup = 1;
    for (const groupKey of Object.values(FeatureSystemGroups)) {
      let group = await this.groupRepo.findOne({ where: { name: groupKey } });

      if (!group) {
        group = this.groupRepo.create({
          name: groupKey,
          order: orderGroup,
        });
        await this.groupRepo.save(group);
        this.logger.log(`Created group: ${groupKey} (order=${orderGroup})`);
      }
      orderGroup++;

      const features = FeatureFlagSystems[groupKey];
      let orderFeature = 1;

      for (const featureKey of Object.values(features)) {
        const exists = await this.featureRepo.findOne({
          where: {
            name: featureKey,
            group: { id: group.id },
          },
          relations: ['group'],
        });

        if (!exists) {
          const feature = this.featureRepo.create({
            name: featureKey,
            groupName: group.name,
            order: orderFeature,
            isLocked: false,
            group,
          });
          await this.featureRepo.save(feature);
          this.logger.log(
            `Created feature: ${groupKey}:${featureKey} (order=${orderFeature})`,
          );
        }
        orderFeature++;
      }
    }

    this.logger.log('Feature flag sync completed.');
  }
}
