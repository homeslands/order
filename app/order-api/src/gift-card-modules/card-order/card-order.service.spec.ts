import { Test, TestingModule } from '@nestjs/testing';
import { CardOrderService } from './card-order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Card } from '../card/entities/card.entity';
import { CardOrder } from './entities/card-order.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

describe('CardOrderService', () => {
  let service: CardOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardOrderService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Card),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(CardOrder),
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

    service = module.get<CardOrderService>(CardOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
