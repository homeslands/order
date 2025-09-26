import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagSystemService } from './feature-flag-system.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { FeatureFlagSystem } from './entities/feature-flag-system.entity';
import { FeatureSystemGroup } from './entities/feature-system-group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('FeatureFlagSystemService', () => {
  let service: FeatureFlagSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagSystemService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(FeatureFlagSystem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(FeatureSystemGroup),
          useFactory: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        { provide: DataSource, useFactory: dataSourceMockFactory },
      ],
    }).compile();

    service = module.get<FeatureFlagSystemService>(FeatureFlagSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
