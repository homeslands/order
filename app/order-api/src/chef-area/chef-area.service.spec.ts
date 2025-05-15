import { Test, TestingModule } from '@nestjs/testing';
import { ChefAreaService } from './chef-area.service';
import { ChefAreaUtils } from './chef-area.utils';
import { BranchUtils } from 'src/branch/branch.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChefArea } from './chef-area.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Branch } from 'src/branch/branch.entity';

describe('ChefAreaService', () => {
  let service: ChefAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChefAreaService,
        ChefAreaUtils,
        BranchUtils,
        {
          provide: getRepositoryToken(ChefArea),
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
