import { Test, TestingModule } from '@nestjs/testing';
import { GiftCardController } from './gift-card.controller';
import { GiftCardService } from './gift-card.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GiftCard } from './entities/gift-card.entity';

describe('GiftCardController', () => {
  let controller: GiftCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiftCardController],
      providers: [
        GiftCardService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(GiftCard),
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

    controller = module.get<GiftCardController>(GiftCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
