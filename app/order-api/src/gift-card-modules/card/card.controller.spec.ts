import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { FileService } from 'src/file/file.service';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { File } from 'src/file/file.entity';

describe('CardController', () => {
  let controller: CardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        CardService,
        FileService,
        TransactionManagerService,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(Card),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(File),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },],
    }).compile();

    controller = module.get<CardController>(CardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
