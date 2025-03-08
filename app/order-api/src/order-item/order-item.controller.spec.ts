import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Menu } from 'src/menu/menu.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { Order } from 'src/order/order.entity';
import { Variant } from 'src/variant/variant.entity';
import { OrderUtils } from 'src/order/order.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { OrderItemUtils } from './order-item.utils';
import { VariantUtils } from 'src/variant/variant.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { OrderScheduler } from 'src/order/order.scheduler';
import { SchedulerRegistry } from '@nestjs/schedule';

describe('OrderItemController', () => {
  let controller: OrderItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItemController],
      providers: [
        OrderItemService,
        TransactionManagerService,
        OrderUtils,
        OrderItemUtils,
        VariantUtils,
        MenuUtils,
        MenuItemUtils,
        PromotionUtils,
        OrderScheduler,
        SchedulerRegistry,
        {
          provide: getRepositoryToken(Promotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ApplicablePromotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Variant),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
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

    controller = module.get<OrderItemController>(OrderItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
