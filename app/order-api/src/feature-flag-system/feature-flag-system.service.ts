import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FeatureFlagSystem } from './entities/feature-flag-system.entity';
import { FeatureSystemGroup } from './entities/feature-system-group.entity';
import { Mapper } from '@automapper/core';
import {
  BulkUpdateFeatureFlagSystemRequestDto,
  FeatureFlagSystemResponseDto,
  FeatureSystemGroupResponseDto,
} from './feature-flag-system.dto';
import { InjectMapper } from '@automapper/nestjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { FeatureFlagSystemException } from './feature-flag-system.exception';
import { FeatureFlagSystemValidation } from './feature-flag-system.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
// import * as Redis from 'ioredis';

@Injectable()
export class FeatureFlagSystemService {
  // private redis: Redis.Redis;

  constructor(
    @InjectRepository(FeatureFlagSystem)
    private readonly featureFlagSystemRepository: Repository<FeatureFlagSystem>,
    @InjectRepository(FeatureSystemGroup)
    private readonly featureSystemGroupRepository: Repository<FeatureSystemGroup>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
  ) {
    // this.redis = new Redis();
  }

  // private cacheKey(flagKey: string): string {
  //   return `feature_flag:${flagKey}`;
  // }

  async isEnabled(group: string, feature: string): Promise<boolean> {
    // const cached = await this.redis.get(this.cacheKey(flagKey));
    // if (cached !== null) {
    //   return cached === 'true';
    // }

    const flag = await this.featureFlagSystemRepository.findOne({
      where: { name: feature, groupName: group },
    });
    const enabled = flag?.isLocked ?? false;

    // await this.redis.set(this.cacheKey(flagKey), enabled.toString(), 'EX', 60); // cache 60s
    return enabled;
  }

  async setFlag(flagKey: string, enabled: boolean): Promise<void> {
    await this.featureFlagSystemRepository.save({
      name: flagKey,
      isLocked: enabled,
    });
    // await this.redis.set(this.cacheKey(flagKey), enabled.toString(), 'EX', 60);
  }

  async getAllFeaturesGroupSystem(): Promise<FeatureSystemGroupResponseDto[]> {
    const groups = await this.featureSystemGroupRepository.find({
      order: {
        order: 'ASC',
      },
    });

    return this.mapper.mapArray(
      groups,
      FeatureSystemGroup,
      FeatureSystemGroupResponseDto,
    );
  }

  async getAllFeaturesFlagSystem(
    groupName: string,
  ): Promise<FeatureFlagSystemResponseDto[]> {
    const features = await this.featureFlagSystemRepository.find({
      where: { groupName },
      order: {
        order: 'ASC',
      },
    });
    return this.mapper.mapArray(
      features,
      FeatureFlagSystem,
      FeatureFlagSystemResponseDto,
    );
  }

  async bulkToggle(body: BulkUpdateFeatureFlagSystemRequestDto) {
    const context = `${FeatureFlagSystemService.name}.${this.bulkToggle.name}`;
    this.logger.log(
      `Bulk toggle feature flag system req: ${JSON.stringify(body)}`,
      context,
    );

    const slugs = body.updates.map((item) => item.slug);
    const flags = await this.featureFlagSystemRepository.find({
      where: {
        slug: In(slugs),
      },
    });

    const updates = [];
    for (const update of body.updates) {
      const flag = flags.find((item) => item.slug === update.slug);
      if (flag) {
        flag.isLocked = update.isLocked;
        updates.push(flag);
      }
    }

    await this.transactionService.execute<FeatureFlagSystem[]>(
      async (manager) => {
        return await manager.save(updates);
      },
      (results) => {
        this.logger.log(
          `feature flag system ${results.map((item) => item.slug).join(', ')} updated successfully`,
          context,
        );
      },
      (err) => {
        this.logger.error(
          `Error when bulk toggle feature flag system: ${err.message}`,
          err.stack,
          context,
        );
        throw new FeatureFlagSystemException(
          FeatureFlagSystemValidation.ERROR_WHEN_UPDATE_FEATURE_FLAG_SYSTEM,
        );
      },
    );
  }
}
