import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BranchUtils } from './branch.utils';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { CreateBranchDto, UpdateBranchDto } from './branch.dto';
import { BranchException } from './branch.exception';
import { BranchValidation } from './branch.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource, Repository } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { Mapper } from '@automapper/core';

describe('BranchService', () => {
  let service: BranchService;
  let branchUtils: BranchUtils;
  let mockDataSource: DataSource;
  let mapperMock: MockType<Mapper>;
  let mockBranchRepository: MockType<Repository<Branch>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        BranchUtils,
        TransactionManagerService,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
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

    service = module.get<BranchService>(BranchService);
    branchUtils = module.get<BranchUtils>(BranchUtils);
    mockDataSource = module.get(DataSource);
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
    mockBranchRepository = module.get(getRepositoryToken(Branch));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Update branch', () => {
    it('Show throw error when branch not found', async () => {
      // Mock data
      const mockSlug = 'mock-slug';
      const mockUpdateBranchDto = {} as UpdateBranchDto;

      jest
        .spyOn(branchUtils, 'getBranch')
        .mockRejectedValue(
          new BranchException(BranchValidation.BRANCH_NOT_FOUND),
        );

      // Test
      await expect(
        service.updateBranch(mockSlug, mockUpdateBranchDto),
      ).rejects.toThrow(BranchException);
    });

    it('Should update branch successfully when prodived valid data', async () => {
      // Mock data
      const mockSlug = 'mock-slug';
      const mockUpdateBranchDto = {
        name: 'mock-name',
        address: 'mock-branch',
      } as UpdateBranchDto;
      const mockBranch = {
        slug: mockSlug,
        name: 'mock-name',
        address: 'mock-branch',
      } as Branch;

      jest.spyOn(branchUtils, 'getBranch').mockResolvedValue(mockBranch);

      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockBranch),
        },
      });

      mapperMock.map.mockReturnValue(mockBranch);

      // assert
      const result = await service.updateBranch(mockSlug, mockUpdateBranchDto);
      expect(result).toEqual(mockBranch);
    });
  });

  describe('Create branch', () => {
    it('Should create branch successfully when provided valid data', async () => {
      // Mock data
      const mockCreateBranchDto = {
        name: 'mock-name',
        address: 'mock-branch',
      } as CreateBranchDto;
      const mockBranch = {
        name: 'mock-name',
        address: 'mock-branch',
      } as Branch;

      mapperMock.map.mockReturnValue(mockBranch);

      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockBranch),
        },
      });

      // assert
      const result = await service.createBranch(mockCreateBranchDto);
      expect(result).toEqual(mockBranch);
    });
  });

  describe('Retrieve all branch', () => {
    it('Should return all branches successfully', async () => {
      // Mock data
      const mockBranches = [
        {
          name: 'mock-name',
          address: 'mock-branch',
        },
      ] as Branch[];
      jest.spyOn(mockBranchRepository, 'find').mockReturnValue(mockBranches);

      // assert
      const result = await service.getAllBranches();
      expect(result).toEqual(mockBranches);
    });
  });

  describe('Delete branch', () => {
    it('Should delete branch successfully when provided valid data', async () => {
      // Mock data
      const mockSlug = 'mock-slug';
      const mockBranch = {
        slug: mockSlug,
        name: 'mock-name',
        address: 'mock-branch',
      } as Branch;

      jest.spyOn(branchUtils, 'getBranch').mockResolvedValue(mockBranch);

      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          remove: jest.fn().mockResolvedValue(mockBranch),
        },
      });

      // assert
      const result = await service.deleteBranch(mockSlug);
      expect(result).toEqual(mockBranch);
    });
  });
});
