import { Test, TestingModule } from '@nestjs/testing';
import { BranchConfigController } from './branch-config.controller';
import { BranchConfigService } from './branch-config.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BranchConfig } from './branch-config.entity';

describe('BranchConfigController', () => {
  let controller: BranchConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchConfigController],
      providers: [
        BranchConfigService,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(BranchConfig),
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

    controller = module.get<BranchConfigController>(BranchConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
