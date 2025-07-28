import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceAreaService } from './invoice-area.service';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Printer } from 'src/printer/entity/printer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { InvoiceArea } from './invoice-area.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('InvoiceAreaService', () => {
  let service: InvoiceAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceAreaService,
        {
          provide: getRepositoryToken(Printer),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(InvoiceArea),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: {},
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    service = module.get<InvoiceAreaService>(InvoiceAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
