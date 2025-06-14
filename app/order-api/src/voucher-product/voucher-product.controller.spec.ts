import { Test, TestingModule } from '@nestjs/testing';
import { VoucherProductController } from './voucher-product.controller';
import { VoucherProductService } from './voucher-product.service';
import { VoucherProduct } from './voucher-product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Voucher } from 'src/voucher/voucher.entity';
import { Product } from 'src/product/product.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

describe('VoucherProductController', () => {
  let controller: VoucherProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoucherProductController],
      providers: [
        VoucherProductService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(VoucherProduct),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Voucher),
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
      ],
    }).compile();

    controller = module.get<VoucherProductController>(VoucherProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
