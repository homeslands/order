import { Inject, Injectable, Logger } from '@nestjs/common';
import { ZaloOaConnectorConfig } from './entity/zalo-oa-connector.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateZaloOaConnectorConfigRequestDto,
  ZaloOaCallbackStatusRequestDto,
  ZaloOaConnectorConfigResponseDto,
} from './zalo-oa-connector.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ZaloOaConnectorValidation } from './zalo-oa-connector.validation';
import { ZaloOaConnectorException } from './zalo-oa-connector.exception';
import { ZaloOaConnectorHistory } from './entity/zalo-oa-connector-history.entity';
import {
  SmsStatusNumber,
  SmsStatusStringRecord,
  SmsTypeNumber,
  SmsTypeStringRecord,
  TelecomProviderNumber,
  TelecomProviderStringRecord,
} from './zalo-oa-connector.constants';

@Injectable()
export class ZaloOaConnectorService {
  constructor(
    @InjectRepository(ZaloOaConnectorConfig)
    private readonly zaloOaConnectorConfigRepository: Repository<ZaloOaConnectorConfig>,
    @InjectRepository(ZaloOaConnectorHistory)
    private readonly zaloOaConnectorHistoryRepository: Repository<ZaloOaConnectorHistory>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async createZaloOaConnectorConfig(
    createZaloOaConnectorConfigRequestDto: CreateZaloOaConnectorConfigRequestDto,
  ): Promise<ZaloOaConnectorConfigResponseDto> {
    const context = `${ZaloOaConnectorService.name}.${this.createZaloOaConnectorConfig.name}`;
    this.logger.log(`Request create zalo oa connector config`, context);
    const zaloOaConnectorConfig = this.mapper.map(
      createZaloOaConnectorConfigRequestDto,
      CreateZaloOaConnectorConfigRequestDto,
      ZaloOaConnectorConfig,
    );
    const existingZaloOaConnectorConfig =
      await this.zaloOaConnectorConfigRepository.findOne({
        where: {
          strategy: zaloOaConnectorConfig.strategy,
        },
      });
    if (existingZaloOaConnectorConfig) {
      this.logger.warn(`Zalo oa connector config already exists`, context);
      throw new ZaloOaConnectorException(
        ZaloOaConnectorValidation.ZALO_OA_CONNECTOR_CONFIG_ALREADY_EXISTS,
      );
    }
    const savedZaloOaConnectorConfig =
      await this.zaloOaConnectorConfigRepository.save(zaloOaConnectorConfig);
    return this.mapper.map(
      savedZaloOaConnectorConfig,
      ZaloOaConnectorConfig,
      ZaloOaConnectorConfigResponseDto,
    );
  }

  async getZaloOaConnectorConfigs(): Promise<
    ZaloOaConnectorConfigResponseDto[]
  > {
    const context = `${ZaloOaConnectorService.name}.${this.getZaloOaConnectorConfigs.name}`;
    this.logger.log(`Request get zalo oa connector configs`, context);
    const zaloOaConnectorConfigs =
      await this.zaloOaConnectorConfigRepository.find();
    return this.mapper.mapArray(
      zaloOaConnectorConfigs,
      ZaloOaConnectorConfig,
      ZaloOaConnectorConfigResponseDto,
    );
  }

  async deleteZaloOaConnectorConfig(slug: string): Promise<number> {
    const context = `${ZaloOaConnectorService.name}.${this.deleteZaloOaConnectorConfig.name}`;
    this.logger.log(`Request delete zalo oa connector config`, context);
    const zaloOaConnectorConfig =
      await this.zaloOaConnectorConfigRepository.findOne({
        where: {
          slug,
        },
      });
    if (!zaloOaConnectorConfig) {
      this.logger.warn(`Zalo oa connector config not found`, context);
      throw new ZaloOaConnectorException(
        ZaloOaConnectorValidation.ZALO_OA_CONNECTOR_CONFIG_NOT_FOUND,
      );
    }
    const deleted = await this.zaloOaConnectorConfigRepository.delete(
      zaloOaConnectorConfig.id,
    );
    return deleted.affected || 0;
  }

  async callback(requestData: ZaloOaCallbackStatusRequestDto) {
    const context = `${ZaloOaConnectorService.name}.${this.callback.name}`;
    this.logger.log(
      `Callback zalo oa to update status ${JSON.stringify(requestData)}`,
      context,
    );

    const zaloOaConnectorHistory =
      await this.zaloOaConnectorHistoryRepository.findOne({
        where: {
          smsId: requestData.SMSID,
        },
      });
    if (!zaloOaConnectorHistory) {
      this.logger.warn(`Zalo oa connector history not found`, context);
      throw new ZaloOaConnectorException(
        ZaloOaConnectorValidation.ZALO_OA_CONNECTOR_HISTORY_NOT_FOUND,
      );
    }

    let status = null;
    switch (requestData.SendStatus) {
      case SmsStatusNumber.WAITING_FOR_APPROVAL:
        status = SmsStatusStringRecord[SmsStatusNumber.WAITING_FOR_APPROVAL];
        break;
      case SmsStatusNumber.WAITING_FOR_SEND:
        status = SmsStatusStringRecord[SmsStatusNumber.WAITING_FOR_SEND];
        break;
      case SmsStatusNumber.REJECTED:
        status = SmsStatusStringRecord[SmsStatusNumber.REJECTED];
        break;
      case SmsStatusNumber.SENT:
        status = SmsStatusStringRecord[SmsStatusNumber.SENT];
        break;
      case SmsStatusNumber.WAITING_FOR_REPORT:
        status = SmsStatusStringRecord[SmsStatusNumber.WAITING_FOR_REPORT];
        break;
      default:
        status = null;
        break;
    }

    let type = null;
    switch (requestData.TypeId) {
      case SmsTypeNumber.ADVERTISING:
        type = SmsTypeStringRecord[SmsTypeNumber.ADVERTISING];
        break;
      case SmsTypeNumber.CUSTOMER_CARE:
        type = SmsTypeStringRecord[SmsTypeNumber.CUSTOMER_CARE];
        break;
      case SmsTypeNumber.VIBER:
        type = SmsTypeStringRecord[SmsTypeNumber.VIBER];
        break;
      case SmsTypeNumber.PRIORITIZED_ZALO:
        type = SmsTypeStringRecord[SmsTypeNumber.PRIORITIZED_ZALO];
        break;
      case SmsTypeNumber.NORMAL_ZALO:
        type = SmsTypeStringRecord[SmsTypeNumber.NORMAL_ZALO];
        break;
      default:
        type = null;
        break;
    }

    let telecomProvider = null;
    switch (requestData.telcoid) {
      case TelecomProviderNumber.VIETTEL:
        telecomProvider =
          TelecomProviderStringRecord[TelecomProviderNumber.VIETTEL];
        break;
      case TelecomProviderNumber.MOBI:
        telecomProvider =
          TelecomProviderStringRecord[TelecomProviderNumber.MOBI];
        break;
      case TelecomProviderNumber.VINA:
        telecomProvider =
          TelecomProviderStringRecord[TelecomProviderNumber.VINA];
        break;
      case TelecomProviderNumber.VIETNAM_MOBILE:
        telecomProvider =
          TelecomProviderStringRecord[TelecomProviderNumber.VIETNAM_MOBILE];
        break;
      case TelecomProviderNumber.GTEL:
        telecomProvider =
          TelecomProviderStringRecord[TelecomProviderNumber.GTEL];
        break;
      case TelecomProviderNumber.ITEL:
        telecomProvider =
          TelecomProviderStringRecord[TelecomProviderNumber.ITEL];
        break;
      case TelecomProviderNumber.REDDI:
        telecomProvider =
          TelecomProviderStringRecord[TelecomProviderNumber.REDDI];
        break;
      default:
        telecomProvider = null;
        break;
    }

    Object.assign(zaloOaConnectorHistory, {
      status: status,
      type: type,
      telecomProvider: telecomProvider,
      errorInfo: requestData.error_info,
    });
    await this.zaloOaConnectorHistoryRepository.save(zaloOaConnectorHistory);
    return requestData.SMSID;
  }
}
