import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ACBInitiateQRCodeRequestDto,
  ACBInitiateQRCodeResponseDto,
  ACBTokenRequestDto,
  ACBTokenResponseDto,
} from './acb-connector.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import { ACBConnectorConfigException } from './acb-connector.exception';
import { ACBConnectorValidation } from './acb-connector.validation';

@Injectable()
export class ACBConnectorClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getAuthAcbApiUrl() {
    return await this.systemConfigService.get(SystemConfigKey.AUTH_ACB_API_URL);
  }

  async getAcbApiUrl() {
    return await this.systemConfigService.get(SystemConfigKey.ACB_API_URL);
  }

  /**
   * Get token from ACB API
   * @param {ACBTokenRequestDto} requestData
   * @returns {Promise<ACBTokenResponseDto>}
   */
  async token(requestData: ACBTokenRequestDto): Promise<ACBTokenResponseDto> {
    const context = `${ACBConnectorClient.name}.${this.token.name}`;
    const requestUrl = `${await this.getAuthAcbApiUrl()}/auth/realms/soba/protocol/openid-connect/token`;
    const { data } = await firstValueFrom(
      this.httpService
        .post<ACBTokenResponseDto>(requestUrl, requestData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Get token from ACB API failed: ${JSON.stringify(error.response?.data)}`,
              error.stack,
              context,
            );
            throw new ACBConnectorConfigException(
              ACBConnectorValidation.GET_ACB_TOKEN_FAIL,
              error.message,
            );
          }),
        ),
    );
    this.logger.log(`Get token from ACB API success`, context);
    return data;
  }

  /**
   * Initiate QR Code from ACB API
   * @param {any} headers Headers for request
   * @param {ACBInitiateQRCodeRequestDto} requestData Request data for initiate QR Code
   * @param {string} accessToken Access token from ACB API
   * @returns {Promise<ACBInitiateQRCodeResponseDto>} Result of initiate QR Code
   */
  async initiateQRCode(
    headers: any,
    requestData: ACBInitiateQRCodeRequestDto,
    accessToken: string,
  ): Promise<ACBInitiateQRCodeResponseDto> {
    const context = `${ACBConnectorClient.name}.${this.initiateQRCode.name}`;
    const requestUrl = `${await this.getAcbApiUrl()}/payments/qr-payment/v1/initiate`;
    const { data } = await firstValueFrom(
      this.httpService
        .post<ACBInitiateQRCodeResponseDto>(requestUrl, requestData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...headers,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Init QR Code from ACB API failed: ${JSON.stringify(error)}`,
              error.stack,
              context,
            );
            throw new ACBConnectorConfigException(
              ACBConnectorValidation.INITIATE_QR_CODE_FAIL,
              error.message,
            );
          }),
        ),
    );
    return data;
  }

  async retrieveQRCode() {}
}
