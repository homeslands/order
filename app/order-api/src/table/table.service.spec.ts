import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from './table.service';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { DataSource, Repository } from 'typeorm';
import { Table } from './table.entity';
import { Branch } from 'src/branch/branch.entity';
import { Mapper } from '@automapper/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { CreateTableRequestDto, UpdateTableRequestDto } from './table.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { RobotConnectorClient } from 'src/robot-connector/robot-connector.client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BranchException } from 'src/branch/branch.exception';
import { TableException } from './table.exception';
import { QRLocationResponseDto } from 'src/robot-connector/robot-connector.dto';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { BranchUtils } from 'src/branch/branch.utils';
import { TableUtils } from './table.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { TableValidation } from './table.validation';
import { BranchValidation } from 'src/branch/branch.validation';

describe('TableService', () => {
  let service: TableService;
  let tableRepositoryMock: MockType<Repository<Table>>;
  let branchRepositoryMock: MockType<Repository<Branch>>;
  let mapperMock: MockType<Mapper>;
  let robotConnectorClient: RobotConnectorClient;
  let mockDataSource: MockType<DataSource>;
  let tableUtils: TableUtils;
  let branchUtils: BranchUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        RobotConnectorClient,
        HttpService,
        SystemConfigService,
        BranchUtils,
        TableUtils,
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SALT_ROUNDS') {
                return 10;
              }
              return null;
            }),
          },
        },
        {
          provide: getRepositoryToken(Table),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
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

    service = module.get<TableService>(TableService);
    tableRepositoryMock = module.get(getRepositoryToken(Table));
    branchRepositoryMock = module.get(getRepositoryToken(Branch));
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
    robotConnectorClient =
      module.get<RobotConnectorClient>(RobotConnectorClient);
    mockDataSource = module.get(DataSource);
    tableUtils = module.get(TableUtils);
    branchUtils = module.get(BranchUtils);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create table', () => {
    it('should throw error when branch is not found', async () => {
      const mockInput = {
        name: 'Mock table name',
        branch: 'mock-branch-slug',
        location: 'mock-location-abfA',
      } as CreateTableRequestDto;

      jest
        .spyOn(branchUtils, 'getBranch')
        .mockRejectedValue(
          new BranchException(BranchValidation.BRANCH_NOT_FOUND),
        );
      await expect(service.create(mockInput)).rejects.toThrow(BranchException);
    });

    it('should throw error when name of table already exist at this branch', async () => {
      const mockInput = {
        name: 'Mock table name',
        branch: 'mock-branch-slug',
        location: 'mock-location-abfA',
      } as CreateTableRequestDto;
      const branch = {
        name: 'Mock branch name',
        address: 'Mock branch address',
        id: 'mock-branch-id',
        slug: 'mock-branch-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Branch;
      const mockOutput = {
        name: 'Mock table name',
        branch: new Branch(),
        id: 'mock-table-id',
        slug: 'mock-table-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Table;

      (branchRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(branch);
      (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);
      (tableRepositoryMock.findOne as jest.Mock).mockResolvedValue(mockOutput);
      jest.spyOn(robotConnectorClient, 'getQRLocationById').mockResolvedValue({
        id: 'mock-location-id',
        name: 'mock-location-name',
        qr_code: 'mock-location-code',
      } as QRLocationResponseDto);

      await expect(service.create(mockInput)).rejects.toThrow(TableException);
    });

    it('should create table when provided data is valid', async () => {
      const mockInput = {
        name: 'Mock table name',
        branch: 'mock-branch-slug',
        location: 'mock-location-abfA',
      } as CreateTableRequestDto;

      const branch = {
        name: 'Mock branch name',
        address: 'Mock branch address',
        id: 'mock-branch-id',
        slug: 'mock-branch-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Branch;

      const mockOutput = {
        name: 'Mock table name',
        branch: new Branch(),
        id: 'mock-table-id',
        slug: 'mock-table-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Table;

      const mockLocation = {
        id: 'mock-location-abfA',
        name: 'mock-location-name',
        qr_code: 'mock-location-code',
      } as QRLocationResponseDto;

      // Mock
      jest.spyOn(branchUtils, 'getBranch').mockResolvedValue(branch);
      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockOutput),
        },
      });
      (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);
      jest
        .spyOn(robotConnectorClient, 'getQRLocationById')
        .mockResolvedValue(mockLocation);

      // Compare
      expect(await service.create(mockInput)).toEqual(mockOutput);
    });
  });

  describe('Get all tables by branch', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when branch is not found', async () => {
      const branchSlug = 'mock-branch-slug';
      (branchRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.findAll(branchSlug)).rejects.toThrow(
        BranchException,
      );
    });

    it('should get success and return a array of tables', async () => {
      const branchSlug = 'mock-branch-slug';
      const branch = {
        name: 'Mock branch name',
        address: 'Mock branch address',
        id: 'mock-branch-id',
        slug: 'mock-branch-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Branch;
      const table = {
        name: 'Mock table name',
        branch: new Branch(),
        id: 'mock-table-id',
        slug: 'mock-table-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Table;
      const mockOutput = [table];

      (branchRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(branch);
      (tableRepositoryMock.find as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.mapArray as jest.Mock).mockReturnValue(mockOutput);

      const result = await service.findAll(branchSlug);
      expect(result).toEqual(mockOutput);
      expect(mapperMock.mapArray).toHaveBeenCalledTimes(1);
    });
  });

  describe('Change table status', () => {
    it('should throw error when table is not found', async () => {
      const slug = 'mock-table-slug';
      (tableRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(
        service.changeStatus(slug, { status: 'active' }),
      ).rejects.toThrow(TableException);
    });

    it('should change status success and return changed table data', async () => {
      const slug = 'mock-table-slug';
      const table = {
        name: 'Mock table name',
        branch: new Branch(),
        id: 'mock-table-id',
        slug: 'mock-table-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Table;
      const mockOutput = {
        name: 'Mock table name',
        branch: new Branch(),
        id: 'mock-table-id',
        slug: 'mock-table-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Table;

      (tableRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(table);
      (tableRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);

      const result = await service.changeStatus(slug, { status: 'active' });
      expect(result).toEqual(mockOutput);
      expect(mapperMock.map).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update table', () => {
    it('should throw error when table is not found', async () => {
      const slug = 'mock-table-slug';
      const mockInput = {
        name: 'Mock table name',
        location: 'mock-table-location',
      } as UpdateTableRequestDto;
      jest
        .spyOn(tableUtils, 'getTable')
        .mockRejectedValue(new TableException(TableValidation.TABLE_NOT_FOUND));

      await expect(service.update(slug, mockInput)).rejects.toThrow(
        TableException,
      );
    });

    it('Should update the table when provided data is valid', async () => {
      const slug = 'mock-table-slug';

      const mockInput = {
        name: 'Mock table name',
        location: 'mock-table-location',
      } as UpdateTableRequestDto;

      const mockOutput = {
        name: 'Mock table name',
        branch: new Branch(),
        id: 'mock-table-id',
        slug: 'mock-table-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Table;

      jest.spyOn(tableUtils, 'getTable').mockResolvedValue(mockOutput);
      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockOutput),
        },
      });
      (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);

      expect(await service.update(slug, mockInput)).toEqual(mockOutput);
    });
  });

  describe('Delete table', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when table is not found', async () => {
      const slug = 'mock-table-slug';
      (tableRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(slug)).rejects.toThrow(TableException);
    });

    it('should delete success and return deleted records', async () => {
      const slug = 'mock-table-slug';
      const table = {
        name: 'Mock table name',
        branch: new Branch(),
        id: 'mock-table-id',
        slug: 'mock-table-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Table;
      const mockOutput = 1;

      jest.spyOn(tableUtils, 'getTable').mockResolvedValue(table);

      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          // save: jest.fn().mockResolvedValue(mockOutput),
          remove: jest.fn().mockResolvedValue(table),
        },
      });

      expect(await service.remove(slug)).toEqual(mockOutput);
    });
  });
});
