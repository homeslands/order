import { Test, TestingModule } from '@nestjs/testing';
import { VoucherGroupService } from './voucher-group.service';
import { VoucherGroupUtils } from './voucher-group.utils';
import { VoucherGroupScheduler } from './voucher-group.scheduler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { VoucherGroup } from './voucher-group.entity';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Voucher } from 'src/voucher/voucher.entity';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { Order } from 'src/order/order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { UserUtils } from 'src/user/user.utils';
import { User } from 'src/user/user.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { ProductUtils } from 'src/product/product.utils';
import { Product } from 'src/product/product.entity';
import { PaymentUtils } from 'src/payment/payment.utils';
import { Payment } from 'src/payment/payment.entity';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { HttpService } from '@nestjs/axios';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { ConfigService } from '@nestjs/config';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';

describe('VoucherGroupService', () => {
  let service: VoucherGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherGroupService,
        VoucherGroupScheduler,
        VoucherGroupUtils,
        TransactionManagerService,
        VoucherUtils,
        OrderUtils,
        UserUtils,
        MenuUtils,
        MenuItemUtils,
        ProductUtils,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        SystemConfigService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: getRepositoryToken(VoucherGroup),
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
          provide: getRepositoryToken(SystemConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Voucher),
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
          provide: getRepositoryToken(Order),
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
          provide: getRepositoryToken(VoucherProduct),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<VoucherGroupService>(VoucherGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
