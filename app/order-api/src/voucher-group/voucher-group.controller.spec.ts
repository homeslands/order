import { Test, TestingModule } from '@nestjs/testing';
import { VoucherGroupController } from './voucher-group.controller';
import { VoucherGroupService } from './voucher-group.service';
import { VoucherGroupScheduler } from './voucher-group.scheduler';
import { VoucherGroupUtils } from './voucher-group.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { OrderUtils } from 'src/order/order.utils';
import { UserUtils } from 'src/user/user.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { VoucherGroup } from './voucher-group.entity';
import { User } from 'src/user/user.entity';
import { Voucher } from 'src/voucher/voucher.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Order } from 'src/order/order.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
describe('VoucherGroupController', () => {
  let controller: VoucherGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherGroupController],
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
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: getRepositoryToken(VoucherGroup),
          useFactory: repositoryMockFactory,
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
      ],
    }).compile();

    controller = module.get<VoucherGroupController>(VoucherGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
