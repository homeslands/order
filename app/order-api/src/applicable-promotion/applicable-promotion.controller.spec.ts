import { Test, TestingModule } from '@nestjs/testing';
import { ApplicablePromotionController } from './applicable-promotion.controller';
import { ApplicablePromotionService } from './applicable-promotion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApplicablePromotion } from './applicable-promotion.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Promotion } from 'src/promotion/promotion.entity';
import { Product } from 'src/product/product.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ApplicablePromotionUtils } from './applicable-promotion.utils';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('ApplicablePromotionController', () => {
  let controller: ApplicablePromotionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicablePromotionController],
      providers: [
        ApplicablePromotionService,
        ApplicablePromotionUtils,
        PromotionUtils,
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
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    controller = module.get<ApplicablePromotionController>(
      ApplicablePromotionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
