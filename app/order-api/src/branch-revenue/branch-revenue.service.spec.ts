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
import { PdfService } from 'src/pdf/pdf.service';
import { OrderUtils } from 'src/order/order.utils';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { Order } from 'src/order/order.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Mutex } from 'async-mutex';
import { PaymentUtils } from 'src/payment/payment.utils';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { Payment } from 'src/payment/payment.entity';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';
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
        PdfService,
        QrCodeService,
        OrderUtils,
        MenuItemUtils,
        MenuUtils,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        SystemConfigService,
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
          provide: Mutex,
          useValue: {
            acquire: jest.fn(),
            runExclusive: jest.fn(),
          },
        },
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(BranchRevenue),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
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
