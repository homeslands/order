import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureFlag } from './entities/feature-flag.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { FeatureFlagResponseDto } from './dto/feature-flag-response.dto';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { QueryFeatureFlagDto } from './dto/query-feature-flag.dto';
import { BulkUpdateFeatureFlagDto } from './dto/bulk-update-feature-flag.dto';
import { FeatureGroup } from './entities/feature-group.entity';
import { FeatureGroupResponseDto } from './dto/feature-group-response.dto';
import { FeatureFlagException } from './feature-flag.exception';
import { FeatureFlagValidation } from './feature-flag.validation';
import { FindFeatureFlagDto } from './dto/find-feature-flag.dto';
import * as _ from 'lodash';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlag)
    private ffRepository: Repository<FeatureFlag>,
    @InjectRepository(FeatureGroup)
    private groupRepository: Repository<FeatureGroup>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private transactionService: TransactionManagerService,
  ) {}

  async find(req: FindFeatureFlagDto) {
    const context = `${FeatureFlagService.name}.${this.find.name}`;
    this.logger.log(`Find feature flag req: ${JSON.stringify(req)}`, context);

    if (_.isEmpty(req)) {
      throw new FeatureFlagException(FeatureFlagValidation.MISSING_PARAMS);
    }

    const whereOpts: FindOptionsWhere<FeatureFlag> = {};
    if (req.name) whereOpts.name = req.name;
    if (req.slug) whereOpts.slug = req.slug;

    const ff = await this.ffRepository.findOne({
      where: whereOpts,
    });

    return this.mapper.map(ff, FeatureFlag, FeatureFlagResponseDto);
  }

  async bulkToggle(body: BulkUpdateFeatureFlagDto) {
    const context = `${FeatureFlagService.name}.${this.bulkToggle.name}`;
    this.logger.log(
      `Bulk toggle feature flag req: ${JSON.stringify(body)}`,
      context,
    );

    const slugs = body.updates.map((item) => item.slug);
    const flags = await this.ffRepository.find({
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

    await this.transactionService.execute<FeatureFlag[]>(
      async (manager) => {
        return await manager.save(updates);
      },
      (results) => {
        this.logger.log(
          `feature flag ${results.map((item) => item.slug).join(', ')} updated successfully`,
          context,
        );
      },
      (err) => {
        this.logger.error(
          `Error when bulk toggle feature flag: ${err.message}`,
          err.stack,
          context,
        );
        throw new FeatureFlagException(
          FeatureFlagValidation.ERROR_WHEN_UPDATE_FEATURE_FLAG,
        );
      },
    );
  }

  async query(req: QueryFeatureFlagDto) {
    const context = `${FeatureFlagService.name}.${this.query.name}`;
    this.logger.log(`Query feature flag req: ${JSON.stringify(req)}`, context);

    const whereOpts: FindOptionsWhere<FeatureFlag> = {};
    if (req.groupName) whereOpts.groupName = req.groupName;

    const ffs = await this.ffRepository.find({
      where: whereOpts,
      order: {
        order: 'ASC',
      },
    });

    return this.mapper.mapArray(ffs, FeatureFlag, FeatureFlagResponseDto);
  }

  async getGroup() {
    const groups = await this.groupRepository.find({
      order: {
        order: 'ASC',
        features: {
          order: 'ASC',
        },
      },
      relations: ['features'],
    });

    return this.mapper.mapArray(groups, FeatureGroup, FeatureGroupResponseDto);
  }
}
