import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { ApplicablePromotionService } from './applicable-promotion.service';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { ApplicablePromotionUtils } from './applicable-promotion.utils';
import { ApplicablePromotion } from './applicable-promotion.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { Product } from 'src/product/product.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { ProductUtils } from 'src/product/product.utils';

describe('ApplicablePromotionService', () => {
  let service: ApplicablePromotionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicablePromotionService,
        PromotionUtils,
        ApplicablePromotionUtils,
        ProductUtils,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: getRepositoryToken(ApplicablePromotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Promotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
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

    service = module.get<ApplicablePromotionService>(
      ApplicablePromotionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
