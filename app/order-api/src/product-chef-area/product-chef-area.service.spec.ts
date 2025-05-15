import { Test, TestingModule } from '@nestjs/testing';
import { ProductChefAreaService } from './product-chef-area.service';
import { ChefAreaUtils } from 'src/chef-area/chef-area.utils';
import { ProductChefAreaUtils } from './product-chef-area.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { ProductChefArea } from './product-chef-area.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Product } from 'src/product/product.entity';
import { ProductUtils } from 'src/product/product.utils';

describe('ProductChefAreaService', () => {
  let service: ProductChefAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<ProductChefAreaService>(ProductChefAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
