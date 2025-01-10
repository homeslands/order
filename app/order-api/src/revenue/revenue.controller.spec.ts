import { Test, TestingModule } from '@nestjs/testing';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Revenue } from './revenue.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';


describe('RevenueController', () => {
  let controller: RevenueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevenueController],
      providers: [
        RevenueService,
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Revenue),
          useValue: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    controller = module.get<RevenueController>(RevenueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
