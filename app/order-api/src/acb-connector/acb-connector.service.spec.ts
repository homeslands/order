import { Test, TestingModule } from '@nestjs/testing';
import { ACBConnectorService } from './acb-connector.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { ACBConnectorConfig } from './acb-connector.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import {
  CreateACBConnectorConfigRequestDto,
  UpdateACBConnectorConfigRequestDto,
} from './acb-connector.dto';
import { ACBConnectorConfigException } from './acb-connector.exception';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { ACBConnectorUtils } from './acb-connector.utils';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('ACBConnectorService', () => {
  let service: ACBConnectorService;
  let acbConfigRepositoryMock: MockType<Repository<ACBConnectorConfig>>;
  let mapperMock: MockType<Mapper>;
  let mockDataSource: DataSource;
  let acbConnectorUtils: ACBConnectorUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ACBConnectorService,
        TransactionManagerService,
        ACBConnectorUtils,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
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

    service = module.get<ACBConnectorService>(ACBConnectorService);
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
    acbConfigRepositoryMock = module.get(
      getRepositoryToken(ACBConnectorConfig),
    );
    mockDataSource = module.get(DataSource);
    acbConnectorUtils = module.get(ACBConnectorUtils);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get ACB Config', () => {
    it('should return null if no config exists', async () => {
      // Mock
      acbConfigRepositoryMock.find.mockReturnValue([]);
      // Execute
      expect(await service.get()).toBeNull();
    });

    it('should return config if exists', async () => {
      // Mock
      const mockAcbConfigRepo = new ACBConnectorConfig();
      const mockAcbConfigResponseDto = mockAcbConfigRepo;
      acbConfigRepositoryMock.find.mockReturnValue([mockAcbConfigRepo]);
      mapperMock.map.mockReturnValue(mockAcbConfigResponseDto);

      // Assert
      expect(await service.get()).toEqual(mockAcbConfigResponseDto);
    });
  });

  describe('Create ACB Config', () => {
    it('should throw ACB exception if config exists', async () => {
      // Mock
      const mockInput = {} as CreateACBConnectorConfigRequestDto;
      acbConfigRepositoryMock.find.mockReturnValue([new ACBConnectorConfig()]);

      // Assert
      await expect(service.create(mockInput)).rejects.toThrow(
        ACBConnectorConfigException,
      );
    });

    it('should create config if not exists', async () => {
      // mock
      const mockInput = {} as CreateACBConnectorConfigRequestDto;
      const mockAcbConfig = new ACBConnectorConfig();
      const mockAcbConfigResponseDto = mockAcbConfig;

      acbConfigRepositoryMock.find.mockReturnValue([]);
      mapperMock.map
        .mockReturnValueOnce(mockAcbConfig)
        .mockReturnValueOnce(mockAcbConfigResponseDto);

      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockAcbConfig),
        },
      });

      // Execute
      expect(await service.create(mockInput)).toEqual(mockAcbConfigResponseDto);
    });
  });

  describe('Update ACB Config', () => {
    it('should update config successfully if exists', async () => {
      // Mock
      const mockInput = {} as UpdateACBConnectorConfigRequestDto;
      const mockSlug = 'slug';
      const mockAcbConfig = new ACBConnectorConfig();
      const mockAcbConfigResponseDto = mockAcbConfig;

      jest
        .spyOn(acbConnectorUtils, 'getAcbConfig')
        .mockResolvedValue(mockAcbConfig);

      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockAcbConfig),
        },
      });

      // Execute
      expect(await service.update(mockSlug, mockInput)).toEqual(
        mockAcbConfigResponseDto,
      );
    });
  });
});
