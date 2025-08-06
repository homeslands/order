import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Menu } from 'src/menu/menu.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { Order } from 'src/order/order.entity';
import { Variant } from 'src/variant/variant.entity';
import { OrderUtils } from 'src/order/order.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
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
import { Payment } from 'src/payment/payment.entity';
import { Voucher } from 'src/voucher/voucher.entity';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { UserUtils } from 'src/user/user.utils';
import { User } from 'src/user/user.entity';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { ProductUtils } from 'src/product/product.utils';
import { Product } from 'src/product/product.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { PaymentUtils } from 'src/payment/payment.utils';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { Invoice } from 'src/invoice/invoice.entity';

describe('OrderItemController', () => {
  let controller: OrderItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItemController],
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
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Promotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ApplicablePromotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
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
      ],
    }).compile();

    controller = module.get<OrderItemController>(OrderItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
