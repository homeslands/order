import { Test, TestingModule } from '@nestjs/testing';
import { BranchRevenueController } from './branch-revenue.controller';
import { BranchRevenueService } from './branch-revenue.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BranchRevenue } from './branch-revenue.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Branch } from 'src/branch/branch.entity';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { BranchUtils } from 'src/branch/branch.utils';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/file.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { Menu } from 'src/menu/menu.entity';
import { Order } from 'src/order/order.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { OrderUtils } from 'src/order/order.utils';
import { Mutex } from 'async-mutex';
import { PaymentUtils } from 'src/payment/payment.utils';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { Payment } from 'src/payment/payment.entity';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SystemConfig } from 'src/system-config/system-config.entity';
describe('BranchRevenueController', () => {
  let controller: BranchRevenueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchRevenueController],
      providers: [
        BranchRevenueService,
        TransactionManagerService,
        BranchUtils,
        FileService,
        PdfService,
        QrCodeService,
        OrderUtils,
        MenuItemUtils,
        MenuUtils,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        SystemConfigService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: Mutex,
          useValue: {
            acquire: jest.fn(),
            runExclusive: jest.fn(),
          },
        },
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(BranchRevenue),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(File),
          useValue: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    controller = module.get<BranchRevenueController>(BranchRevenueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
