import { Test, TestingModule } from '@nestjs/testing';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { VoucherUtils } from './voucher.utils';
import { OrderUtils } from 'src/order/order.utils';
import { Order } from 'src/order/order.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { UserUtils } from 'src/user/user.utils';
import { User } from 'src/user/user.entity';
import { VoucherGroupUtils } from 'src/voucher-group/voucher-group.utils';
import { VoucherGroup } from 'src/voucher-group/voucher-group.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';

describe('VoucherController', () => {
  let controller: VoucherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherController],
      providers: [
        VoucherService,
        VoucherUtils,
        OrderUtils,
        MenuUtils,
        MenuItemUtils,
        UserUtils,
        VoucherGroupUtils,
        PdfService,
        QrCodeService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Voucher),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(VoucherGroup),
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
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
      ],
    }).compile();

    controller = module.get<VoucherController>(VoucherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
