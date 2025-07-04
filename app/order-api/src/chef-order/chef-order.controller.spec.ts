import { Test, TestingModule } from '@nestjs/testing';
import { ChefOrderController } from './chef-order.controller';
import { ChefOrderService } from './chef-order.service';
import { ChefOrderUtils } from './chef-order.utils';
import { OrderUtils } from 'src/order/order.utils';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from 'src/order/order.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { ChefOrder } from './chef-order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { ChefAreaUtils } from 'src/chef-area/chef-area.utils';
import { BranchUtils } from 'src/branch/branch.utils';
import { Branch } from 'src/branch/branch.entity';
import { ChefOrderItemUtils } from 'src/chef-order-item/chef-order-item.utils';
import { PdfService } from 'src/pdf/pdf.service';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { HttpService } from '@nestjs/axios';
import { PaymentUtils } from 'src/payment/payment.utils';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'src/payment/payment.entity';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { PrinterUtils } from 'src/printer/printer.utils';
import { PrinterManager } from 'src/printer/printer.manager';
import { Printer } from 'src/printer/printer.entity';
import { PrinterProducer } from 'src/printer/printer.producer';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ChefOrderController', () => {
  let controller: ChefOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChefOrderController],
      providers: [
        ChefOrderService,
        TransactionManagerService,
        ChefOrderUtils,
        OrderUtils,
        MenuItemUtils,
        MenuUtils,
        ChefAreaUtils,
        BranchUtils,
        ChefOrderItemUtils,
        PdfService,
        SystemConfigService,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        PrinterUtils,
        PrinterManager,
        PrinterProducer,
        {
          provide: getRepositoryToken(Printer),
          useFactory: repositoryMockFactory,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(), // Mock the emit method
          },
        },
        {
          provide: 'BullQueue_printer',
          useValue: {},
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
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefArea),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
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
      ],
    }).compile();

    controller = module.get<ChefOrderController>(ChefOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
