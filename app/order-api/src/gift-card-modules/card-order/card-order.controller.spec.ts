import { Test, TestingModule } from '@nestjs/testing';
import { CardOrderController } from './card-order.controller';
import { CardOrderService } from './card-order.service';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Card } from '../card/entities/card.entity';
import { CardOrder } from './entities/card-order.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Payment } from 'src/payment/payment.entity';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { ConfigService } from '@nestjs/config';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { HttpService } from '@nestjs/axios';
import { SystemConfigService } from 'src/system-config/system-config.service';

describe('CardOrderController', () => {
  let controller: CardOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardOrderController],
      providers: [
        CardOrderService,
        TransactionManagerService,
        ConfigService,
        BankTransferStrategy,
        ACBConnectorClient,
        HttpService,
        SystemConfigService,
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Card),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(CardOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CardOrderController>(CardOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
