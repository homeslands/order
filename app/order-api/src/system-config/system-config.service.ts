import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CreateSystemConfigDto,
  DeleteSystemConfigDto,
  GetSystemConfigQueryDto,
  SystemConfigResponseDto,
  UpdateSystemConfigDto,
} from './system-config.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemConfig } from './system-config.entity';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as _ from 'lodash';
import { SystemConfigException } from './system-config.exception';
import { SystemConfigValidation } from './system-config.validation';
import { SystemConfigKey } from './system-config.constant';

@Injectable()
export class SystemConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  public requestTtl: number;
  public blockRequestDuration: number;
  public guestLimitTime: number;
  public customerLimitTime: number;
  public staffLimitTime: number;
  public chefLimitTime: number;
  public managerLimitTime: number;
  public adminLimitTime: number;
  public superAdminLimitTime: number;

  async onModuleInit() {
    const context = `${SystemConfigService.name}.${this.onModuleInit.name}`;
    this.logger.log(
      'Starting load the value from system config for role throttler',
      context,
    );
    this.requestTtl = Number(await this.get(SystemConfigKey.REQUEST_TTL));
    this.blockRequestDuration = Number(
      await this.get(SystemConfigKey.BLOCK_REQUEST_DURATION),
    );
    this.guestLimitTime = Number(
      await this.get(SystemConfigKey.GUEST_LIMIT_TIME),
    );
    this.customerLimitTime = Number(
      await this.get(SystemConfigKey.CUSTOMER_LIMIT_TIME),
    );
    this.staffLimitTime = Number(
      await this.get(SystemConfigKey.STAFF_LIMIT_TIME),
    );
    this.chefLimitTime = Number(
      await this.get(SystemConfigKey.CHEF_LIMIT_TIME),
    );
    this.managerLimitTime = Number(
      await this.get(SystemConfigKey.MANAGER_LIMIT_TIME),
    );
    this.adminLimitTime = Number(
      await this.get(SystemConfigKey.ADMIN_LIMIT_TIME),
    );
    this.superAdminLimitTime = Number(
      await this.get(SystemConfigKey.SUPER_ADMIN_LIMIT_TIME),
    );
    this.logger.log(
      `System config loaded for role throttler successfully`,
      context,
    );
  }

  async create(createSystemConfigDto: CreateSystemConfigDto) {
    const context = `${SystemConfigService.name}.${this.create.name}`;
    this.logger.log(
      `Create config with ${createSystemConfigDto.key}=${createSystemConfigDto.value}`,
      context,
    );
    try {
      const systemConfig = await this.systemConfigRepository.save(
        createSystemConfigDto,
      );
      this.logger.log(
        `System config ${systemConfig.slug} created successfully`,
        context,
      );
      return this.mapper.map(
        systemConfig,
        SystemConfig,
        SystemConfigResponseDto,
      );
    } catch (error) {
      this.logger.error(
        `Error when creating system config ${JSON.stringify(error)}`,
        context,
      );
      throw new SystemConfigException(
        SystemConfigValidation.CREATE_SYSTEM_CONFIG_ERROR,
        `Error when creating system config ${error.message}`,
      );
    }
  }

  async findAll() {
    const systemConfigs = await this.systemConfigRepository.find({
      order: { createdAt: 'DESC' },
    });
    return this.mapper.mapArray(
      systemConfigs,
      SystemConfig,
      SystemConfigResponseDto,
    );
  }

  async get(key: string, isLog: boolean = true): Promise<string> {
    const context = `${SystemConfigService.name}.${this.get.name}`;
    const systemConfig = await this.systemConfigRepository.findOne({
      where: {
        key,
      },
    });
    if (!systemConfig) {
      if (isLog) this.logger.warn(`Value of ${key} is not found`, context);
      return '';
    }
    return systemConfig.value;
  }

  async findOne(query: GetSystemConfigQueryDto) {
    if (_.isEmpty(query))
      throw new SystemConfigException(
        SystemConfigValidation.SYSTEM_CONFIG_QUERY_INVALID,
        'Query must not be empty',
      );

    const systemConfig = await this.systemConfigRepository.findOne({
      where: {
        key: query.key,
        slug: query.slug,
      },
    });
    if (!systemConfig)
      throw new SystemConfigException(
        SystemConfigValidation.SYSTEM_CONFIG_NOT_FOUND,
      );
    return this.mapper.map(systemConfig, SystemConfig, SystemConfigResponseDto);
  }

  async update(slug: string, updateSystemConfigDto: UpdateSystemConfigDto) {
    const systemConfig = await this.systemConfigRepository.findOne({
      where: {
        slug,
      },
    });
    if (!systemConfig)
      throw new SystemConfigException(
        SystemConfigValidation.SYSTEM_CONFIG_NOT_FOUND,
      );

    Object.assign(systemConfig, {
      ...updateSystemConfigDto,
    });

    const updatedSystemConfig =
      await this.systemConfigRepository.save(systemConfig);
    return this.mapper.map(
      updatedSystemConfig,
      SystemConfig,
      SystemConfigResponseDto,
    );
  }

  async remove(requestData: DeleteSystemConfigDto) {
    const systemConfig = await this.systemConfigRepository.findOne({
      where: {
        key: requestData.key,
        slug: requestData.slug,
      },
    });
    if (!systemConfig)
      throw new SystemConfigException(
        SystemConfigValidation.SYSTEM_CONFIG_NOT_FOUND,
      );

    const deletedSystemConfig =
      await this.systemConfigRepository.remove(systemConfig);
    return this.mapper.map(
      deletedSystemConfig,
      SystemConfig,
      SystemConfigResponseDto,
    );
  }
}
