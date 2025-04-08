import { Test, TestingModule } from '@nestjs/testing';
import { BranchRevenueService } from './branch-revenue.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BranchRevenue } from './branch-revenue.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { Branch } from 'src/branch/branch.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { File } from 'src/file/file.entity';
import { DataSource } from 'typeorm';
import { BranchUtils } from 'src/branch/branch.utils';
import { FileService } from 'src/file/file.service';
// import { Between } from 'typeorm';
// import { BranchRevenueException } from './branch-revenue.exception';
// import { MockType } from 'src/test-utils/repository-mock.factory';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
// import { Mapper } from '@automapper/core';
// import {
//   ExportBranchRevenueQueryDto,
//   GetBranchRevenueQueryDto,
// } from './branch-revenue.dto';
// import { BranchRevenueValidation } from './branch-revenue.validation';

describe('BranchRevenueService', () => {
  let service: BranchRevenueService;
  // let branchRevenueRepositoryMock: MockType<Repository<BranchRevenue>>;
  // let fileService: FileService;
  // let branchUtils: BranchUtils;
  // let mapperMock: MockType<Mapper>;

  // const mockBranch = {
  //   id: '1',
  //   name: 'Test Branch',
  //   address: 'Test Address',
  //   slug: 'test-branch',
  // };

  // const mockBranchRevenues = [
  //   {
  //     id: '1',
  //     branchId: '1',
  //     date: new Date('2024-01-01'),
  //     totalOrder: 10,
  //     originalAmount: 1000,
  //     promotionAmount: 100,
  //     voucherAmount: 50,
  //     totalAmount: 850,
  //   },
  //   {
  //     id: '2',
  //     branchId: '1',
  //     date: new Date('2024-01-02'),
  //     totalOrder: 15,
  //     originalAmount: 1500,
  //     promotionAmount: 150,
  //     voucherAmount: 75,
  //     totalAmount: 1275,
  //   },
  // ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchRevenueService,
        TransactionManagerService,
        BranchUtils,
        FileService,
        {
          provide: FileService,
          useValue: {
            removeFile: jest.fn(),
            uploadFile: jest.fn(),
            uploadFiles: jest.fn(),
            handleDuplicateFilesName: jest.fn(),
          },
        },
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: getRepositoryToken(BranchRevenue),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(File),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BranchRevenueService>(BranchRevenueService);
    // branchRevenueRepositoryMock = module.get(getRepositoryToken(BranchRevenue));
    // fileService = module.get<FileService>(FileService);
    // branchUtils = module.get<BranchUtils>(BranchUtils);
    // mapperMock = module.get(MAPPER_MODULE_PROVIDER);

    // // Mock BranchUtils
    // branchUtils.getBranch = jest.fn().mockResolvedValue(mockBranch);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('exportBranchRevenueToExcel', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should export branch revenue to Excel successfully', async () => {
  //     const mockRequestData: ExportBranchRevenueQueryDto = {
  //       branch: 'test-branch',
  //       startDate: new Date('2024-01-01'),
  //       endDate: new Date('2024-01-02'),
  //     };

  //     const mockExcelFile = {
  //       name: 'test.xlsx',
  //       extension: 'xlsx',
  //       mimetype:
  //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //       data: Buffer.from('test'),
  //       size: 4,
  //     };

  //     (branchRevenueRepositoryMock.find as jest.Mock).mockResolvedValue(
  //       mockBranchRevenues,
  //     );
  //     (fileService.generateExcelFile as jest.Mock).mockResolvedValue(
  //       mockExcelFile,
  //     );

  //     const result = await service.exportBranchRevenueToExcel(mockRequestData);

  //     expect(branchUtils.getBranch).toHaveBeenCalledWith({
  //       where: { slug: mockRequestData.branch },
  //     });
  //     expect(branchRevenueRepositoryMock.find).toHaveBeenCalledWith({
  //       where: {
  //         branchId: mockBranch.id,
  //         date: Between(mockRequestData.startDate, mockRequestData.endDate),
  //       },
  //       order: {
  //         date: 'ASC',
  //       },
  //     });
  //     expect(fileService.generateExcelFile).toHaveBeenCalled();
  //     expect(result).toEqual(mockExcelFile);
  //   });

  //   it('should handle errors when exporting to Excel', async () => {
  //     const mockRequestData: ExportBranchRevenueQueryDto = {
  //       branch: 'test-branch',
  //       startDate: new Date('2024-01-01'),
  //       endDate: new Date('2024-01-02'),
  //     };

  //     const error = new Error('Test error');
  //     (branchRevenueRepositoryMock.find as jest.Mock).mockRejectedValue(error);

  //     await expect(
  //       service.exportBranchRevenueToExcel(mockRequestData),
  //     ).rejects.toThrow(BranchRevenueException);

  //     expect(branchUtils.getBranch).toHaveBeenCalled();
  //     expect(branchRevenueRepositoryMock.find).toHaveBeenCalled();
  //   });
  // });

  // describe('findAll', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should find all branch revenues by day', async () => {
  //     const mockQuery: GetBranchRevenueQueryDto = {
  //       startDate: new Date('2024-01-01'),
  //       endDate: new Date('2024-01-02'),
  //       type: 'day',
  //     };

  //     (branchRevenueRepositoryMock.find as jest.Mock).mockResolvedValue(
  //       mockBranchRevenues,
  //     );
  //     (mapperMock.mapArray as jest.Mock).mockReturnValue(mockBranchRevenues);

  //     const result = await service.findAll('test-branch', mockQuery);

  //     expect(branchUtils.getBranch).toHaveBeenCalled();
  //     expect(branchRevenueRepositoryMock.find).toHaveBeenCalled();
  //     expect(mapperMock.mapArray).toHaveBeenCalled();
  //     expect(result).toEqual(mockBranchRevenues);
  //   });

  //   it('should find all branch revenues by month', async () => {
  //     const mockQuery: GetBranchRevenueQueryDto = {
  //       startDate: new Date('2024-01-01'),
  //       endDate: new Date('2024-01-02'),
  //       type: 'month',
  //     };

  //     (branchRevenueRepositoryMock.find as jest.Mock).mockResolvedValue(
  //       mockBranchRevenues,
  //     );
  //     (mapperMock.mapArray as jest.Mock).mockReturnValue(mockBranchRevenues);

  //     // mapperMock.mapArray.mockReturnValue(mockBranchRevenues);

  //     const result = await service.findAll('test-branch', mockQuery);

  //     expect(branchUtils.getBranch).toHaveBeenCalled();
  //     expect(branchRevenueRepositoryMock.find).toHaveBeenCalled();
  //     expect(mapperMock.mapArray).toHaveBeenCalled();
  //     expect(result).toEqual(mockBranchRevenues);
  //   });

  //   it('should find all branch revenues by year', async () => {
  //     const mockQuery: GetBranchRevenueQueryDto = {
  //       startDate: new Date('2024-01-01'),
  //       endDate: new Date('2024-01-02'),
  //       type: 'year',
  //     };

  //     (branchRevenueRepositoryMock.find as jest.Mock).mockResolvedValue(
  //       mockBranchRevenues,
  //     );
  //     (mapperMock.mapArray as jest.Mock).mockReturnValue(mockBranchRevenues);

  //     // mapperMock.mapArray.mockReturnValue(mockBranchRevenues);

  //     const result = await service.findAll('test-branch', mockQuery);

  //     expect(branchUtils.getBranch).toHaveBeenCalled();
  //     expect(branchRevenueRepositoryMock.find).toHaveBeenCalled();
  //     expect(mapperMock.mapArray).toHaveBeenCalled();
  //     expect(result).toEqual(mockBranchRevenues);
  //   });
  // });

  // describe('updateLatestBranchRevenueInCurrentDate', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should update latest branch revenue successfully', async () => {
  //     const mockQueryResult = [
  //       {
  //         branchId: '1',
  //         totalOrder: 10,
  //         originalAmount: 1000,
  //         promotionAmount: 100,
  //         voucherAmount: 50,
  //         totalAmount: 850,
  //       },
  //     ];

  //     (branchRevenueRepositoryMock.query as jest.Mock).mockResolvedValue(
  //       mockQueryResult,
  //     );
  //     (branchRevenueRepositoryMock.find as jest.Mock).mockResolvedValue([]);
  //     (branchRevenueRepositoryMock.save as jest.Mock).mockResolvedValue(
  //       mockBranchRevenues[0],
  //     );

  //     await service.updateLatestBranchRevenueInCurrentDate();

  //     expect(branchRevenueRepositoryMock.query).toHaveBeenCalled();
  //     expect(branchRevenueRepositoryMock.save).toHaveBeenCalled();
  //   });

  //   it('should handle errors when updating branch revenue', async () => {
  //     (branchRevenueRepositoryMock.query as jest.Mock).mockRejectedValue(
  //       new BranchRevenueException(
  //         BranchRevenueValidation.REFRESH_BRANCH_REVENUE_ERROR,
  //       ),
  //     );

  //     await expect(
  //       service.updateLatestBranchRevenueInCurrentDate(),
  //     ).rejects.toThrow(BranchRevenueException);
  //   });
  // });
});
