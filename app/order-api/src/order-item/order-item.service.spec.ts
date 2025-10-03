import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemService } from './order-item.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { OrderItem } from './order-item.entity';
import { Variant } from 'src/variant/variant.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderUtils } from 'src/order/order.utils';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { Menu } from 'src/menu/menu.entity';
import { Order } from 'src/order/order.entity';
import { OrderItemUtils } from './order-item.utils';
import { VariantUtils } from 'src/variant/variant.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { OrderScheduler } from 'src/order/order.scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Branch } from 'src/branch/branch.entity';
import { Payment } from 'src/payment/entity/payment.entity';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { UserUtils } from 'src/user/user.utils';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { User } from 'src/user/user.entity';
import { ProductUtils } from 'src/product/product.utils';
import { Product } from 'src/product/product.entity';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { PaymentUtils } from 'src/payment/payment.utils';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccumulatedPointService } from 'src/accumulated-point/accumulated-point.service';
import { AccumulatedPoint } from 'src/accumulated-point/entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from 'src/accumulated-point/entities/accumulated-point-transaction-history.entity';
import { FeatureFlagSystemService } from 'src/feature-flag-system/feature-flag-system.service';
import { FeatureFlagSystem } from 'src/feature-flag-system/entities/feature-flag-system.entity';
import { ChildFeatureFlagSystem } from 'src/feature-flag-system/entities/child-feature-flag-system.entity';
import { FeatureSystemGroup } from 'src/feature-flag-system/entities/feature-system-group.entity';

describe('OrderItemService', () => {
  let service: OrderItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderItemService,
        TransactionManagerService,
        OrderUtils,
        OrderItemUtils,
        VariantUtils,
        MenuUtils,
        MenuItemUtils,
        PromotionUtils,
        OrderScheduler,
        SchedulerRegistry,
        VoucherUtils,
        UserUtils,
        ProductUtils,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        SystemConfigService,
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
          provide: getRepositoryToken(Voucher),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ApplicablePromotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Promotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Variant),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
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
          provide: getRepositoryToken(VoucherProduct),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Invoice),
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
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(), // Mock the emit method
          },
        },
        FeatureFlagSystemService,
        {
          provide: getRepositoryToken(FeatureFlagSystem),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(FeatureSystemGroup),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChildFeatureFlagSystem),
          useValue: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<OrderItemService>(OrderItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
