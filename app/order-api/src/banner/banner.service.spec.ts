import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { FileService } from 'src/file/file.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Banner } from './banner.entity';
import { File } from 'src/file/file.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BannerUtils } from './banner.utils';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';

describe('BannerService', () => {
  let service: BannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService, 
        FileService,
        BannerUtils,
        {
          provide: FileService,
          useValue: {
            removeFile: jest.fn(),
            uploadFile: jest.fn(),
            uploadFiles: jest.fn(),
            handleDuplicateFilesName: jest.fn(),
          },
        },
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

    service = module.get<BannerService>(BannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
