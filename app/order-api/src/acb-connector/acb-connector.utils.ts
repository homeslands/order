import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ACBConnectorConfig } from './acb-connector.entity';
import { ACBConnectorConfigException } from './acb-connector.exception';
import { ACBConnectorValidation } from './acb-connector.validation';

@Injectable()
export class ACBConnectorUtils {
  constructor(
    @InjectRepository(ACBConnectorConfig)
    private readonly acbConnectorConfigRepository: Repository<ACBConnectorConfig>,
  ) {}

  async getAcbConfig(
    options: FindOneOptions<ACBConnectorConfig>,
  ): Promise<ACBConnectorConfig> {
    const acbConnectorConfig = await this.acbConnectorConfigRepository.findOne({
      ...options,
    });
    if (!acbConnectorConfig)
      throw new ACBConnectorConfigException(
        ACBConnectorValidation.ACB_CONNECTOR_CONFIG_NOT_FOUND,
      );
    return acbConnectorConfig;
  }
}
