import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { HttpService } from '@nestjs/axios';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { InternalStrategy } from './strategy/internal.strategy';
import { BankTransferStrategy } from './strategy/bank-transfer.strategy';
import { CashStrategy } from './strategy/cash.strategy';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/order/order.entity';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PdfService } from 'src/pdf/pdf.service';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { UserUtils } from 'src/user/user.utils';
import { User } from 'src/user/user.entity';
import { PaymentUtils } from './payment.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { PointStrategy } from './strategy/point.strategy';
import { SharedBalanceService } from 'src/shared/services/shared-balance.service';
import { Balance } from 'src/gift-card-modules/balance/entities/balance.entity';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { OrderUtils } from 'src/order/order.utils';
import { ProductUtils } from 'src/product/product.utils';
import { Invoice } from 'src/invoice/invoice.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { Product } from 'src/product/product.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
import { OrderItemUtils } from 'src/order-item/order-item.utils';
import { OrderItem } from 'src/order-item/order-item.entity';
import { AccumulatedPoint } from 'src/accumulated-point/entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from 'src/accumulated-point/entities/accumulated-point-transaction-history.entity';
import { AccumulatedPointService } from 'src/accumulated-point/accumulated-point.service';
import { CreditCardStrategy } from './strategy/credit-card.strategy';
describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        CashStrategy,
        BankTransferStrategy,
        InternalStrategy,
        ACBConnectorClient,
        PointStrategy,
        HttpService,
        PdfService,
        SystemConfigService,
        UserUtils,
        PaymentUtils,
        TransactionManagerService,
        SharedBalanceService,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SALT_ROUNDS') {
                return 10;
              }
              return null;
            }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(), // Mock the emit method
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
          provide: getRepositoryToken(Order),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Balance),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        VoucherUtils,
        {
          provide: getRepositoryToken(Voucher),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(VoucherProduct),
          useValue: repositoryMockFactory,
        },
        OrderUtils,
        ProductUtils,
        {
          provide: getRepositoryToken(Invoice),
          useValue: repositoryMockFactory,
        },
        MenuItemUtils,
        {
          provide: getRepositoryToken(Product),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: repositoryMockFactory,
        },
        MenuUtils,
        {
          provide: getRepositoryToken(Menu),
          useValue: repositoryMockFactory,
        },
        OrderItemUtils,
        {
          provide: getRepositoryToken(OrderItem),
          useValue: repositoryMockFactory,
        },
        AccumulatedPointService,
        {
          provide: getRepositoryToken(AccumulatedPoint),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(AccumulatedPointTransactionHistory),
          useValue: repositoryMockFactory,
        },
        CreditCardStrategy,
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
