import { Test, TestingModule } from '@nestjs/testing';
import { ChefOrderItemController } from './chef-order-item.controller';
import { ChefOrderItemService } from './chef-order-item.service';
import { ChefOrderItemUtils } from './chef-order-item.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChefOrderItem } from './chef-order-item.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('ChefOrderItemController', () => {
  let controller: ChefOrderItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChefOrderItemController],
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

    controller = module.get<ChefOrderItemController>(ChefOrderItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
