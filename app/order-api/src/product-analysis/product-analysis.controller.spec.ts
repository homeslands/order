import { Test, TestingModule } from '@nestjs/testing';
import { ProductAnalysisController } from './product-analysis.controller';
import { ProductAnalysisService } from './product-analysis.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Branch } from 'src/branch/branch.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from 'src/product/product.entity';
import { ProductAnalysis } from './product-analysis.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';

describe('ProductAnalysisController', () => {
  let controller: ProductAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductAnalysisController],
      providers: [
        ProductAnalysisService,
        {
          provide: getRepositoryToken(ProductAnalysis),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
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
          useValue: console, // Mock logger (or a custom mock)
        },
      ],
    }).compile();

    controller = module.get<ProductAnalysisController>(
      ProductAnalysisController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
