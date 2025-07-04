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
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { Product } from 'src/product/product.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Order } from 'src/order/order.entity';
import { NotificationUtils } from 'src/notification/notification.utils';
import { NotificationProducer } from 'src/notification/notification.producer';
import { User } from 'src/user/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('ChefOrderItemController', () => {
  let controller: ChefOrderItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChefOrderItemController],
      providers: [
        ChefOrderItemService,
        ChefOrderItemUtils,
        ChefOrderUtils,
        NotificationUtils,
        NotificationProducer,
        TransactionManagerService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(), // Mock the emit method
          },
        },
        {
          provide: 'BullQueue_notification',
          useValue: {},
        },
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: 'BullQueue_notification',
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
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
          provide: getRepositoryToken(ChefOrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrder),
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
