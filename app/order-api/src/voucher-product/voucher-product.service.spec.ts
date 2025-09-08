import { Test, TestingModule } from '@nestjs/testing';
import { VoucherProductService } from './voucher-product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VoucherProduct } from './voucher-product.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Product } from 'src/product/product.entity';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('VoucherProductService', () => {
  let service: VoucherProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<VoucherProductService>(VoucherProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
