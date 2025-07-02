import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPaymentStrategy } from './payment.strategy';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/order/order.entity';
import {
  X_CLIENT_ID,
  X_OWNER_NUMBER,
  X_OWNER_TYPE,
  X_PROVIDER_ID,
  X_REQUEST_ID,
} from 'src/acb-connector/acb-connector.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  ACBCancelQRCodeRequestDto,
  ACBInitiateQRCodeRequestDto,
} from 'src/acb-connector/acb-connector.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Payment } from '../payment.entity';
import { PaymentMethod, PaymentStatus } from '../payment.constants';
import { formatMoment, getRandomString } from 'src/helper';
import { OrderException } from 'src/order/order.exception';
import { OrderValidation } from 'src/order/order.validation';
import { ACBConnectorConfigException } from 'src/acb-connector/acb-connector.exception';
import { ACBConnectorValidation } from 'src/acb-connector/acb-connector.validation';
import { validateOrReject } from 'class-validator';
import { SystemConfigException } from 'src/system-config/system-config.exception';
import { SystemConfigValidation } from 'src/system-config/system-config.validation';

@Injectable()
export class BankTransferStrategy implements IPaymentStrategy {
  private readonly clientId: string =
    this.configService.get<string>('ACB_CLIENT_ID');
  private readonly clientSecret: string =
    this.configService.get<string>('ACB_CLIENT_SECRET');

  constructor(
    private readonly acbConnectorClient: ACBConnectorClient,
    private readonly configService: ConfigService,
    @InjectRepository(ACBConnectorConfig)
    private readonly acbConnectorConfigRepository: Repository<ACBConnectorConfig>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async process(order: Order): Promise<Payment> {
    const context = `${BankTransferStrategy.name}.${this.process.name}`;
    const acbConnectorConfigs = await this.acbConnectorConfigRepository.find({
      take: 1,
    });
    if (_.isEmpty(acbConnectorConfigs)) {
      this.logger.error('ACB Connector config not found', null, context);
      throw new ACBConnectorConfigException(
        ACBConnectorValidation.ACB_CONNECTOR_CONFIG_NOT_FOUND,
      );
    }

    // Get token from ACB
    const { access_token } = await this.acbConnectorClient.token({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });

    // Call ACB API to create payment
    const requestTrace = uuidv4();
    const acbConnectorConfig = _.first(acbConnectorConfigs);
    await this.validateAcbConfig(acbConnectorConfig);

    const headers = {
      [X_CLIENT_ID]: this.clientId,
      [X_OWNER_NUMBER]: acbConnectorConfig?.xOwnerNumber,
      [X_OWNER_TYPE]: acbConnectorConfig?.xOwnerType,
      [X_PROVIDER_ID]: acbConnectorConfig?.xProviderId,
      [X_REQUEST_ID]: uuidv4(),
    };

    // Validate order
    await this.validateOrder(order);

    // Convert date to with format: yyyy-MM-ddTHH:mm:ss.SSSZ
    // example: 2024-11-09T11:03:33.033+0700
    const requestDateTime = formatMoment();
    const orderId = order.slug.concat(getRandomString().slice(0, 3));
    this.logger.log(`Request date time: ${requestDateTime}`, context);
    this.logger.log(`Order id: ${orderId}`, context);

    const requestData = {
      requestDateTime: requestDateTime,
      requestTrace: requestTrace,
      requestParameters: {
        traceNumber: requestTrace,
        amount: order.subtotal,
        beneficiaryName: acbConnectorConfig?.beneficiaryName,
        merchantId: getRandomString(),
        orderId: orderId,
        terminalId: getRandomString(),
        userId: order.owner?.id,
        loyaltyCode: getRandomString(),
        virtualAccountPrefix: acbConnectorConfig?.virtualAccountPrefix,
        voucherCode: getRandomString(),
        description: 'hoa don thanh toan',
      },
    } as ACBInitiateQRCodeRequestDto;

    this.logger.warn(
      `Initiate QR Code request: ${JSON.stringify(requestData)}`,
      context,
    );

    const response = await this.acbConnectorClient.initiateQRCode(
      headers,
      requestData,
      access_token,
    );
    this.logger.log(`Initiate QR Code success`, context);

    this.logger.warn(
      `Initiate QR Code response: ${JSON.stringify(response)}`,
      context,
    );
    // Create payment
    const payment = {
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      amount: order.subtotal,
      message: requestData.requestParameters?.description,
      transactionId: response.requestTrace,
      qrCode: response.responseBody?.qrDataUrl,
      userId: order.owner.id,
      statusCode: PaymentStatus.PENDING,
      statusMessage: PaymentStatus.PENDING,
      orderIdBankTransfer: orderId,
    } as Payment;

    this.paymentRepository.create(payment);
    return await this.paymentRepository.save(payment);
  }

  async validateAcbConfig(acbConfig: ACBConnectorConfig) {
    const context = `${BankTransferStrategy.name}.${this.validateAcbConfig.name}`;
    try {
      await validateOrReject(acbConfig);
      this.logger.log(`ACB config`, context);
    } catch (errors) {
      this.logger.error(
        `Order invalid: ${JSON.stringify(errors)}`,
        null,
        context,
      );
      throw new SystemConfigException(
        SystemConfigValidation.SYSTEM_CONFIG_INVALID,
        JSON.stringify(errors),
      );
    }
  }

  async validateOrder(order: Order) {
    const context = `${BankTransferStrategy.name}.${this.validateOrder.name}`;
    try {
      await validateOrReject(order);
      this.logger.log(`Order valid`, context);
    } catch (errors) {
      this.logger.error(
        `Order invalid: ${JSON.stringify(errors)}`,
        null,
        context,
      );
      throw new OrderException(
        OrderValidation.ORDER_INVALID,
        JSON.stringify(errors),
      );
    }
  }

  async cancelQRCode(payment: Payment) {
    const context = `${BankTransferStrategy.name}.${this.cancelQRCode.name}`;
    this.logger.log(`Cancel QR Code`, context);
    const acbConnectorConfigs = await this.acbConnectorConfigRepository.find({
      take: 1,
    });
    if (_.isEmpty(acbConnectorConfigs)) {
      this.logger.error('ACB Connector config not found', null, context);
      throw new ACBConnectorConfigException(
        ACBConnectorValidation.ACB_CONNECTOR_CONFIG_NOT_FOUND,
      );
    }

    // Get token from ACB
    const { access_token } = await this.acbConnectorClient.token({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });

    // Call ACB API to cancel payment
    const requestTrace = payment.transactionId;
    const acbConnectorConfig = _.first(acbConnectorConfigs);
    await this.validateAcbConfig(acbConnectorConfig);

    const headers = {
      [X_CLIENT_ID]: this.clientId,
      [X_OWNER_NUMBER]: acbConnectorConfig?.xOwnerNumber,
      [X_OWNER_TYPE]: acbConnectorConfig?.xOwnerType,
      [X_REQUEST_ID]: uuidv4(),
    };

    const requestDateTime = formatMoment();

    const requestData = {
      requestDateTime: requestDateTime,
      requestTrace: requestTrace,
      requestParameters: {
        traceNumber: requestTrace,
        orderId: payment.orderIdBankTransfer,
        amount: payment.amount,
      },
    } as ACBCancelQRCodeRequestDto;

    this.logger.warn(
      `Cancel QR Code request: ${JSON.stringify(requestData)}`,
      context,
    );

    const response = await this.acbConnectorClient.cancelQRCode(
      headers,
      requestData,
      access_token,
    );
    this.logger.log(`Cancel QR Code success`, context);

    this.logger.warn(
      `Cancel QR Code response: ${JSON.stringify(response)}`,
      context,
    );

    return response;
  }
}
