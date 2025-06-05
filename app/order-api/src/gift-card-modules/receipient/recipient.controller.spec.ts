import { Test, TestingModule } from '@nestjs/testing';
import { ReceipientController } from './recipient.controller';
import { RecipientService } from './recipient.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Recipient } from './entities/receipient.entity';

describe('RecipientController', () => {
  let controller: ReceipientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceipientController],
      providers: [
        RecipientService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(Recipient),
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
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
      ],
    }).compile();

    controller = module.get<ReceipientController>(ReceipientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
