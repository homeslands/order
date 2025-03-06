import { Test, TestingModule } from '@nestjs/testing';
import { ACBConnectorController } from './acb-connector.controller';
import { ACBConnectorService } from './acb-connector.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ACBConnectorConfig } from './acb-connector.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { ACBConnectorUtils } from './acb-connector.utils';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('ACBConnectorController', () => {
  let controller: ACBConnectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ACBConnectorController],
      providers: [
        ACBConnectorService,
        TransactionManagerService,
        ACBConnectorUtils,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
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

    controller = module.get<ACBConnectorController>(ACBConnectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
