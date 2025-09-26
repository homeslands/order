import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagSystemController } from './feature-flag-system.controller';
import { FeatureFlagSystemService } from './feature-flag-system.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeatureFlagSystem } from './entities/feature-flag-system.entity';
import { FeatureSystemGroup } from './entities/feature-system-group.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';

describe('FeatureFlagSystemController', () => {
  let controller: FeatureFlagSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureFlagSystemController],
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

    controller = module.get<FeatureFlagSystemController>(
      FeatureFlagSystemController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
