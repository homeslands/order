import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceItemService } from './invoice-item.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvoiceItem } from './invoice-item.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';

describe('InvoiceItemService', () => {
  let service: InvoiceItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceItemService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(InvoiceItem),
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

    service = module.get<InvoiceItemService>(InvoiceItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
