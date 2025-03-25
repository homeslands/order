import { Test, TestingModule } from '@nestjs/testing';
import { ChefOrderItemService } from './chef-order-item.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { ChefOrderItem } from './chef-order-item.entity';
import { ChefOrderItemUtils } from './chef-order-item.utils';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';

describe('ChefOrderItemService', () => {
  let service: ChefOrderItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChefOrderItemService,
        ChefOrderItemUtils,
        {
          provide: getRepositoryToken(ChefOrderItem),
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

    service = module.get<ChefOrderItemService>(ChefOrderItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
