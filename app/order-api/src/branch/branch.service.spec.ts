import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BranchUtils } from './branch.utils';

describe('BranchService', () => {
  let service: BranchService;
  let branchUtils: BranchUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        BranchUtils,
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

    service = module.get<BranchService>(BranchService);
    branchUtils = module.get<BranchUtils>(BranchUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
