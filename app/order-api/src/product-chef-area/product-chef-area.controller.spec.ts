import { Test, TestingModule } from '@nestjs/testing';
import { ProductChefAreaController } from './product-chef-area.controller';
import { ProductChefAreaService } from './product-chef-area.service';
import { ProductChefAreaUtils } from './product-chef-area.utils';
import { ChefAreaUtils } from 'src/chef-area/chef-area.utils';
import { ProductUtils } from 'src/product/product.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { ProductChefArea } from './product-chef-area.entity';
import { Product } from 'src/product/product.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('ProductChefAreaController', () => {
  let controller: ProductChefAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductChefAreaController],
      providers: [
        ProductChefAreaService,
        ProductChefAreaUtils,
        ChefAreaUtils,
        ProductUtils,
        {
          provide: getRepositoryToken(ChefArea),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProductChefArea),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {},
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: {},
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    controller = module.get<ProductChefAreaController>(
      ProductChefAreaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
