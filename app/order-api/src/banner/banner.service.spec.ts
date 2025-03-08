import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { FileService } from 'src/file/file.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Banner } from './banner.entity';
import { File } from 'src/file/file.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BannerUtils } from './banner.utils';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import {
  BannerResponseDto,
  CreateBannerRequestDto,
  GetBannerQueryDto,
  UpdateBannerRequestDto,
} from './banner.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { Mapper } from '@automapper/core';
import { BannerException } from './banner.exception';
import BannerValidation from './banner.validation';
import { Readable } from 'stream';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('BannerService', () => {
  let service: BannerService;
  let bannerRepositoryMock: MockType<Repository<Banner>>;
  let mapperMock: MockType<Mapper>;
  let bannerUtils: BannerUtils;
  let fileService: FileService;
  let transactionManagerService: TransactionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService,
        FileService,
        BannerUtils,
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
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
          provide: getRepositoryToken(File),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Banner),
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

    service = module.get<BannerService>(BannerService);
    bannerRepositoryMock = module.get(getRepositoryToken(Banner));
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
    bannerUtils = module.get(BannerUtils);
    fileService = module.get<FileService>(FileService);
    transactionManagerService = module.get<TransactionManagerService>(
      TransactionManagerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBanner', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a banner success', async () => {
      const mockInput = {
        title: '',
        content: '',
      } as CreateBannerRequestDto;

      const banner: Banner = {
        title: '',
        content: '',
        isActive: false,
        url: '',
        useButtonUrl: false,
        id: '',
        slug: '',
        createdAt: undefined,
        updatedAt: undefined,
      };

      const mockOutput = {
        title: '',
        content: '',
        image: '',
        isActive: '',
        createdAt: '',
        slug: '',
      } as BannerResponseDto;

      (mapperMock.map as jest.Mock).mockImplementation(() => banner);
      jest
        .spyOn(transactionManagerService, 'execute')
        .mockImplementation(async (onSave) => {
          const mockEntityManager = {
            save: jest.fn().mockResolvedValue(banner),
          } as unknown as EntityManager;
          return onSave(mockEntityManager);
        });
      (mapperMock.map as jest.Mock).mockImplementation(() => mockOutput);
      expect(await service.createBanner(mockInput)).toEqual(mockOutput);
    });
  });

  describe('getAllBanners', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get all banners successfully', async () => {
      const mockInput = {
        isActive: false,
      } as GetBannerQueryDto;

      const bannerDto = {
        title: '',
        content: '',
        image: '',
        isActive: '',
        createdAt: '',
        slug: '',
      } as BannerResponseDto;
      const mockOutput = [bannerDto] as BannerResponseDto[];

      (bannerRepositoryMock.find as jest.Mock).mockResolvedValue([bannerDto]);
      (mapperMock.mapArray as jest.Mock).mockReturnValue(mockOutput);

      expect(await service.getAllBanners(mockInput)).toEqual(mockOutput);
    });
  });

  describe('getSpecificBanner', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if banner not found', async () => {
      jest.spyOn(bannerUtils, 'getBanner').mockImplementation(() => {
        throw new BannerException(BannerValidation.BANNER_NOT_FOUND);
      });
      await expect(service.getSpecificBanner('')).rejects.toThrow(
        BannerException,
      );
    });

    it('should get a specific banner successfully', async () => {
      const banner: Banner = {
        title: '',
        content: '',
        isActive: false,
        id: '',
        slug: '',
        createdAt: undefined,
        updatedAt: undefined,
        url: '',
        useButtonUrl: false,
      };
      const mockOutput = {
        title: '',
        content: '',
        image: '',
        isActive: '',
        createdAt: '',
        slug: '',
      } as BannerResponseDto;

      jest.spyOn(bannerUtils, 'getBanner').mockResolvedValue(banner);
      (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);
      await expect(service.getSpecificBanner('')).resolves.toEqual(mockOutput);
    });
  });

  describe('updateBanner', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if banner not found', async () => {
      const mockInput = {
        title: '',
        content: '',
      } as UpdateBannerRequestDto;

      jest.spyOn(bannerUtils, 'getBanner').mockImplementation(() => {
        throw new BannerException(BannerValidation.BANNER_NOT_FOUND);
      });

      await expect(service.updateBanner('', mockInput)).rejects.toThrow(
        BannerException,
      );
    });

    it('should update a banner successfully', async () => {
      const mockInput = {
        title: '',
        content: '',
      } as UpdateBannerRequestDto;

      const banner: Banner = {
        title: '',
        content: '',
        isActive: false,
        id: '',
        slug: '',
        createdAt: undefined,
        updatedAt: undefined,
        url: '',
        useButtonUrl: false,
      };
      const mockOutput = {
        title: '',
        content: '',
        image: '',
        isActive: '',
        createdAt: '',
        slug: '',
      } as BannerResponseDto;

      jest.spyOn(bannerUtils, 'getBanner').mockResolvedValue(banner);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => banner);
      jest
        .spyOn(transactionManagerService, 'execute')
        .mockImplementation(async (onSave) => {
          const mockEntityManager = {
            save: jest.fn().mockResolvedValue(banner),
          } as unknown as EntityManager;
          return onSave(mockEntityManager);
        });
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);

      expect(await service.updateBanner('', mockInput)).toEqual(mockOutput);
    });
  });

  describe('uploadImageBanner', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if banner not found', async () => {
      const mockInput = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
        buffer: undefined,
      } as Express.Multer.File;

      jest.spyOn(bannerUtils, 'getBanner').mockImplementation(() => {
        throw new BannerException(BannerValidation.BANNER_NOT_FOUND);
      });
      await expect(service.uploadImageBanner('', mockInput)).rejects.toThrow(
        BannerException,
      );
    });

    it('should upload image banner successfully', async () => {
      const mockInput = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        stream: new Readable(),
        destination: '',
        filename: '',
      } as Express.Multer.File;

      const banner: Banner = {
        title: '',
        content: '',
        isActive: false,
        id: '',
        slug: '',
        createdAt: undefined,
        updatedAt: undefined,
        url: '',
        useButtonUrl: false,
      };

      const mockOutput = {
        title: '',
        content: '',
        image: '',
        isActive: '',
        createdAt: '',
        slug: '',
      } as BannerResponseDto;

      const file: File = {
        name: '',
        extension: '',
        mimetype: '',
        data: '',
        size: 0,
        id: '',
        slug: '',
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(bannerUtils, 'getBanner').mockResolvedValue(banner);
      (fileService.removeFile as jest.Mock).mockResolvedValue(undefined);
      (fileService.uploadFile as jest.Mock).mockResolvedValue(file);
      (bannerRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);

      expect(await service.uploadImageBanner('', mockInput)).toEqual(
        mockOutput,
      );
    });
  });

  describe('deleteBanner', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if banner not found', async () => {
      jest.spyOn(bannerUtils, 'getBanner').mockImplementation(() => {
        throw new BannerException(BannerValidation.BANNER_NOT_FOUND);
      });
      await expect(service.deleteBanner('')).rejects.toThrow(BannerException);
    });

    it('should delete a banner successfully', async () => {
      const banner: Banner = {
        title: '',
        content: '',
        isActive: false,
        id: '',
        slug: '',
        createdAt: undefined,
        updatedAt: undefined,
        url: '',
        useButtonUrl: false,
      };
      const mockOutput = { affected: 1 };

      jest.spyOn(bannerUtils, 'getBanner').mockResolvedValue(banner);
      (bannerRepositoryMock.softDelete as jest.Mock).mockResolvedValue(
        mockOutput,
      );

      expect(await service.deleteBanner('')).toEqual(mockOutput.affected);
    });
  });
});
