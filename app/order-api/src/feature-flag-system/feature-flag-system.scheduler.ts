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
import { ChildFeatureFlagSystem } from './entities/child-feature-flag-system.entity';
import { TFeatureFlagSystems } from './feature-flag-system.type';

@Injectable()
export class FeatureFlagSystemScheduler {
  private readonly logger = new Logger(FeatureFlagSystemScheduler.name);

  constructor(
    @InjectRepository(FeatureSystemGroup)
    private groupRepo: Repository<FeatureSystemGroup>,
    @InjectRepository(FeatureFlagSystem)
    private featureRepo: Repository<FeatureFlagSystem>,
    @InjectRepository(ChildFeatureFlagSystem)
    private childFeatureRepo: Repository<ChildFeatureFlagSystem>,
  ) {}

  @Timeout(1000)
  async syncFeatureFlags() {
    this.logger.log('Starting feature flag sync...');

    try {
      for (const groupKey of Object.values(FeatureSystemGroups)) {
        let group = await this.groupRepo.findOne({
          where: { name: groupKey },
          relations: {
            features: {
              children: true,
            },
          },
        });

        if (!group) {
          group = this.groupRepo.create({
            name: groupKey,
          });
          await this.groupRepo.save(group);
          this.logger.log(`Created group: ${groupKey}`);
        }

        const features: TFeatureFlagSystems[typeof groupKey] =
          FeatureFlagSystems[groupKey];

        // Loop features
        for (const featureDef of Object.values(features)) {
          let feature = await this.featureRepo.findOne({
            where: { name: featureDef.key, group: { id: group.id } },
            relations: ['group'],
          });

          if (!feature) {
            feature = this.featureRepo.create({
              name: featureDef.key,
              description: featureDef.description ?? null,
              groupName: group.name,
              isLocked: false,
              group,
            });
            await this.featureRepo.save(feature);
            this.logger.log(`Created feature: ${groupKey}:${featureDef.key}`);
          }

          // If has children → create more in ChildFeatureFlagSystem
          if (featureDef.children) {
            for (const childDef of Object.values(featureDef.children)) {
              const exists = await this.childFeatureRepo.findOne({
                where: {
                  name: childDef.key,
                  featureFlagSystem: { id: feature.id },
                },
                relations: ['featureFlagSystem'],
              });

              if (!exists) {
                const childFeature = new ChildFeatureFlagSystem();
                childFeature.name = childDef.key;
                childFeature.description = childDef.description ?? null;
                childFeature.parentName = featureDef.key;
                childFeature.isLocked = false;
                childFeature.featureFlagSystem = feature;
                await this.childFeatureRepo.save(childFeature);
                this.logger.log(
                  `Created child feature: ${featureDef.key}:${childDef.key}`,
                );
              }
            }
          }
        }
      }

      this.logger.log('Feature flag sync completed.');
    } catch (error) {
      this.logger.error('Error syncing feature flags:', error);
      return;
    }
  }
}
