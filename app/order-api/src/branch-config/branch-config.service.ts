import { Injectable } from '@nestjs/common';
import {
  BranchConfigResponseDto,
  CreateBranchConfigDto,
} from './branch-config.dto';
import { BranchConfig } from './branch-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';
import { Inject } from '@nestjs/common';
import { UpdateBranchConfigDto } from './branch-config.dto';
import { DeleteBranchConfigDto } from './branch-config.dto';
import { GetBranchConfigQueryDto } from './branch-config.dto';
import { Branch } from 'src/branch/branch.entity';
import { BranchConfigException } from './branch-config.exception';
import { BranchConfigValidation } from './branch-config.validation';

@Injectable()
export class BranchConfigService {
  constructor(
    @InjectRepository(BranchConfig)
    private readonly branchConfigRepository: Repository<BranchConfig>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}
  async createBranchConfig(createBranchConfigDto: CreateBranchConfigDto) {
    const context = `${BranchConfigService.name}.${this.createBranchConfig.name}`;
    this.logger.log(
      `Create config with ${createBranchConfigDto.key}=${createBranchConfigDto.value}`,
      context,
    );

    const branch = await this.branchRepository.findOne({
      where: {
        slug: createBranchConfigDto.branchSlug,
      },
    });
    if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);

    const branchConfig = this.mapper.map(
      createBranchConfigDto,
      CreateBranchConfigDto,
      BranchConfig,
    );
    Object.assign(branchConfig, {
      branch,
    });

    try {
      const createdBranchConfig =
        await this.branchConfigRepository.save(branchConfig);
      this.logger.log(
        `Branch config ${branchConfig.slug} created successfully`,
        context,
      );
      return this.mapper.map(
        createdBranchConfig,
        BranchConfig,
        BranchConfigResponseDto,
      );
    } catch (error) {
      this.logger.error(
        `Error when creating branch config ${JSON.stringify(error)}`,
        context,
      );
      throw new BranchConfigException(
        BranchConfigValidation.CREATE_BRANCH_CONFIG_ERROR,
        `Error when creating branch config ${error.message}`,
      );
    }
  }

  async findAllBranchConfigs(branchSlug: string) {
    const branchConfigs = await this.branchConfigRepository.find({
      order: { createdAt: 'DESC' },
      where: {
        branch: {
          slug: branchSlug,
        },
      },
    });
    return this.mapper.mapArray(
      branchConfigs,
      BranchConfig,
      BranchConfigResponseDto,
    );
  }

  async get(
    key: string,
    branchSlug: string,
    isLog: boolean = true,
  ): Promise<string> {
    const context = `${BranchConfigService.name}.${this.get.name}`;
    const branchConfig = await this.branchConfigRepository.findOne({
      where: {
        key,
        branch: {
          slug: branchSlug,
        },
      },
    });
    if (!branchConfig) {
      if (isLog) this.logger.warn(`Value of ${key} is not found`, context);
      return '';
    }
    return branchConfig.value;
  }

  async findOne(query: GetBranchConfigQueryDto) {
    if (!query.key && !query.slug)
      throw new BranchConfigException(
        BranchConfigValidation.BRANCH_CONFIG_QUERY_INVALID,
        'Query must not be empty',
      );

    const branchConfig = await this.branchConfigRepository.findOne({
      where: {
        key: query.key,
        slug: query.slug,
        branch: {
          slug: query.branchSlug,
        },
      },
    });
    if (!branchConfig)
      throw new BranchConfigException(
        BranchConfigValidation.BRANCH_CONFIG_NOT_FOUND,
      );
    return this.mapper.map(branchConfig, BranchConfig, BranchConfigResponseDto);
  }

  async update(slug: string, updateBranchConfigDto: UpdateBranchConfigDto) {
    const branchConfig = await this.branchConfigRepository.findOne({
      where: {
        slug,
      },
      relations: {
        branch: true,
      },
    });

    if (!branchConfig || !branchConfig.branch)
      throw new BranchConfigException(
        BranchConfigValidation.BRANCH_CONFIG_NOT_FOUND,
      );

    const existedBranchConfig = await this.branchConfigRepository.findOne({
      where: {
        key: updateBranchConfigDto.key,
        branch: {
          slug: branchConfig.branch.slug,
        },
        slug: Not(branchConfig.slug),
      },
    });

    if (existedBranchConfig)
      throw new BranchConfigException(
        BranchConfigValidation.BRANCH_CONFIG_ALREADY_EXISTS,
      );

    Object.assign(branchConfig, {
      ...updateBranchConfigDto,
    });

    const updatedBranchConfig =
      await this.branchConfigRepository.save(branchConfig);
    return this.mapper.map(
      updatedBranchConfig,
      BranchConfig,
      BranchConfigResponseDto,
    );
  }

  async remove(requestData: DeleteBranchConfigDto) {
    const branchConfig = await this.branchConfigRepository.findOne({
      where: {
        key: requestData.key,
        slug: requestData.slug,
        branch: {
          slug: requestData.branchSlug,
        },
      },
    });
    if (!branchConfig)
      throw new BranchConfigException(
        BranchConfigValidation.BRANCH_CONFIG_NOT_FOUND,
      );

    const deletedBranchConfig =
      await this.branchConfigRepository.remove(branchConfig);
    return this.mapper.map(
      deletedBranchConfig,
      BranchConfig,
      BranchConfigResponseDto,
    );
  }
}
