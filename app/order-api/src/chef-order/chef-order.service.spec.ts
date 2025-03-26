import { Test, TestingModule } from '@nestjs/testing';
import { ChefOrderService } from './chef-order.service';
import { ChefOrderUtils } from './chef-order.utils';
import { OrderUtils } from 'src/order/order.utils';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Order } from 'src/order/order.entity';
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

describe('ChefOrderService', () => {
  let service: ChefOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
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

    service = module.get<ChefOrderService>(ChefOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
