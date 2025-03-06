import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ACBConnectorConfig } from './acb-connector.entity';
import { IsNull, Repository } from 'typeorm';
import {
  ACBConnectorConfigResponseDto,
  CreateACBConnectorConfigRequestDto,
  UpdateACBConnectorConfigRequestDto,
} from './acb-connector.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as _ from 'lodash';
import { ACBConnectorConfigException } from './acb-connector.exception';
import { ACBConnectorValidation } from './acb-connector.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { ACBConnectorUtils } from './acb-connector.utils';

@Injectable()
export class ACBConnectorService {
  constructor(
    @InjectRepository(ACBConnectorConfig)
    private readonly acbConnectorConfigRepository: Repository<ACBConnectorConfig>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly acbConnectorUtils: ACBConnectorUtils,
  ) {}

  async get() {
    const config = await this.acbConnectorConfigRepository.find({
      take: 1,
    });
    if (config.length === 0) {
      return null;
    }
    return this.mapper.map(
      _.first(config),
      ACBConnectorConfig,
      ACBConnectorConfigResponseDto,
    );
  }

  async create(requestData: CreateACBConnectorConfigRequestDto) {
    const context = `${ACBConnectorService.name}.${this.create.name}`;
    const hasConfig = await this.acbConnectorConfigRepository.find({ take: 1 });
    if (hasConfig.length > 0) {
      this.logger.error('ACB Config already exists', null, context);
      throw new ACBConnectorConfigException(
        ACBConnectorValidation.ACB_CONNECTOR_CONFIG_EXIST,
      );
    }
    const config = this.mapper.map(
      requestData,
      CreateACBConnectorConfigRequestDto,
      ACBConnectorConfig,
    );

    const createdConfig =
      await this.transactionManagerService.execute<ACBConnectorConfig>(
        async (manager) => {
          return await manager.save(config);
        },
        (result) => {
          this.logger.log(
            `ACB Config ${result.slug} created successfully`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Failed to create ACB Config ${error.message}`,
            error.stack,
            context,
          );
          throw new ACBConnectorConfigException(
            ACBConnectorValidation.ACB_CONNECTOR_CONFIG_CREATION_FAILED,
            error.message,
          );
        },
      );
    return this.mapper.map(
      createdConfig,
      ACBConnectorConfig,
      ACBConnectorConfigResponseDto,
    );
  }

  async update(slug: string, requestData: UpdateACBConnectorConfigRequestDto) {
    const context = `${ACBConnectorService.name}.${this.update.name}`;
    const config = await this.acbConnectorUtils.getAcbConfig({
      where: {
        slug: slug ?? IsNull(),
      },
    });

    Object.assign(config, { ...requestData });
    const updatedConfig =
      await this.transactionManagerService.execute<ACBConnectorConfig>(
        async (manager) => {
          return await manager.save(config);
        },
        (result) => {
          this.logger.log(
            `ACB Config ${result.slug} updated successfully`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Failed to update ACB Config ${error.message}`,
            error.stack,
            context,
          );
          throw new ACBConnectorConfigException(
            ACBConnectorValidation.ACB_CONNECTOR_CONFIG_UPDATE_FAILED,
            error.message,
          );
        },
      );

    return this.mapper.map(
      updatedConfig,
      ACBConnectorConfig,
      ACBConnectorConfigResponseDto,
    );
  }
}
