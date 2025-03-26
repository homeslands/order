import { Test, TestingModule } from '@nestjs/testing';
import { ChefOrderItemService } from './chef-order-item.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { ChefOrderItem } from './chef-order-item.entity';
import { ChefOrderItemUtils } from './chef-order-item.utils';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { Order } from 'src/order/order.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';

describe('ChefOrderItemService', () => {
  let service: ChefOrderItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChefOrderItemService,
        ChefOrderItemUtils,
        ChefOrderUtils,
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefArea),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrder),
          useFactory: repositoryMockFactory,
        },
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
