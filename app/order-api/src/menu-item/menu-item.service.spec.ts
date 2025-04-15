import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemService } from './menu-item.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuItem } from './menu-item.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { Product } from 'src/product/product.entity';
import { Menu } from 'src/menu/menu.entity';
import { Catalog } from 'src/catalog/catalog.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { ProductChefArea } from 'src/product-chef-area/product-chef-area.entity';

describe('MenuItemService', () => {
  let service: MenuItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        PromotionUtils,
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ProductChefArea),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ApplicablePromotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Promotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Catalog),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console, // Mock logger (or a custom mock)
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: mapperMockFactory,
        },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
