import { Test, TestingModule } from '@nestjs/testing';
import { ChefAreaController } from './chef-area.controller';
import { ChefAreaService } from './chef-area.service';
import { BranchUtils } from 'src/branch/branch.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChefArea } from './chef-area.entity';
import { Branch } from 'src/branch/branch.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefAreaUtils } from './chef-area.utils';
import { Printer } from 'src/printer/printer.entity';
import { PrinterManager } from 'src/printer/printer.manager';
import { PdfService } from 'src/pdf/pdf.service';
import { PrinterUtils } from 'src/printer/printer.utils';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { PrinterProducer } from 'src/printer/printer.producer';

describe('ChefAreaController', () => {
  let controller: ChefAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChefAreaController],
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

    controller = module.get<ChefAreaController>(ChefAreaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
