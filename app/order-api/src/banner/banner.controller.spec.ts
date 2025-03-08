import { Test, TestingModule } from '@nestjs/testing';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Banner } from './banner.entity';
import { File } from 'src/file/file.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { BannerUtils } from './banner.utils';
import { FileService } from 'src/file/file.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';

describe('BannerController', () => {
  let controller: BannerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerController],
      providers: [
        BannerService,
        FileService,
        BannerUtils,
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: getRepositoryToken(Banner),
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
        {
          provide: getRepositoryToken(File),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<BannerController>(BannerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
