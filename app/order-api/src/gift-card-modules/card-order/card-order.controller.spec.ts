import { Test, TestingModule } from '@nestjs/testing';
import { CardOrderController } from './card-order.controller';
import { CardOrderService } from './card-order.service';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Card } from '../card/entities/card.entity';
import { CardOrder } from './entities/card-order.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

describe('CardOrderController', () => {
  let controller: CardOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardOrderController],
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

    controller = module.get<CardOrderController>(CardOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
