import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import { SystemConfigService } from 'src/system-config/system-config.service';
import {
  ZaloOaInitiateSmsRequestDto,
  ZaloOaInitiateSmsResponseDto,
} from './zalo-oa-connector.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ZaloOaConnectorException } from './zalo-oa-connector.exception';
import { ZaloOaConnectorValidation } from './zalo-oa-connector.validation';

@Injectable()
export class ZaloOaConnectorClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getZaloOaApiUrl() {
    const zaloOaApiUrl = await this.systemConfigService.get(
      SystemConfigKey.ZALO_OA_API_URL,
    );
    if (!zaloOaApiUrl) {
      throw new ZaloOaConnectorException(
        ZaloOaConnectorValidation.ZALO_OA_API_URL_NOT_FOUND,
      );
    }
    return zaloOaApiUrl;
  }

  async initiateSms(requestData: ZaloOaInitiateSmsRequestDto) {
    const context = `${ZaloOaConnectorClient.name}.${this.initiateSms.name}`;
    const requestUrl = `${await this.getZaloOaApiUrl()}/MainService.svc/json/SendZaloMessage_V6/`;
    const { data } = await firstValueFrom(
      this.httpService
        .post<ZaloOaInitiateSmsResponseDto>(requestUrl, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Initiate SMS verify account failed: ${JSON.stringify(error.response?.data)}`,
              error.stack,
              context,
            );
            throw new ZaloOaConnectorException(
              ZaloOaConnectorValidation.INITIATE_SMS_VERIFY_ACCOUNT_FAIL,
              error.message,
            );
          }),
        ),
    );
    this.logger.log(`Initiate SMS verify account success`, context);
    return data;
  }
}
