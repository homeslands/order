import { Test, TestingModule } from '@nestjs/testing';
import { ChefAreaService } from './chef-area.service';
import { ChefAreaUtils } from './chef-area.utils';
import { BranchUtils } from 'src/branch/branch.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChefArea } from './chef-area.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Branch } from 'src/branch/branch.entity';
import { Printer } from 'src/printer/printer.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { PrinterUtils } from 'src/printer/printer.utils';
import { PrinterManager } from 'src/printer/printer.manager';
import { PrinterProducer } from 'src/printer/printer.producer';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';

describe('ChefAreaService', () => {
  let service: ChefAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChefAreaService,
        ChefAreaUtils,
        BranchUtils,
        PdfService,
        PrinterUtils,
        PrinterManager,
        PrinterProducer,
        {
          provide: getRepositoryToken(Printer),
          useFactory: repositoryMockFactory,
        },
        {
          provide: 'BullQueue_printer',
          useValue: {},
        },
        {
          provide: getRepositoryToken(ChefArea),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Printer),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: {},
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

    service = module.get<ChefAreaService>(ChefAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
