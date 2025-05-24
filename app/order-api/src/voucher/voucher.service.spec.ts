import { Test, TestingModule } from '@nestjs/testing';
import { VoucherService } from './voucher.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource, Repository } from 'typeorm';
import { VoucherUtils } from './voucher.utils';
import { OrderUtils } from 'src/order/order.utils';
import { Order } from 'src/order/order.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
import {
  // CreateVoucherDto,
  GetVoucherDto,
  UpdateVoucherDto,
  ValidateVoucherDto,
} from './voucher.dto';
import { Mapper } from '@automapper/core';
import { VoucherException } from './voucher.exception';
import { VoucherValidation } from './voucher.validation';
import { Branch } from 'src/branch/branch.entity';
import { User } from 'src/user/user.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { Payment } from 'src/payment/payment.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { UserUtils } from 'src/user/user.utils';
import { VoucherGroup } from 'src/voucher-group/voucher-group.entity';
import { VoucherGroupUtils } from 'src/voucher-group/voucher-group.utils';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';

describe('VoucherService', () => {
  let service: VoucherService;
  let mockDataSource: DataSource;
  let mapperMock: MockType<Mapper>;
  let voucherRepositoryMock: MockType<Repository<Voucher>>;
  let voucherUtils: VoucherUtils;
  let orderUtils: OrderUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        VoucherUtils,
        OrderUtils,
        MenuUtils,
        MenuItemUtils,
        UserUtils,
        VoucherGroupUtils,
        PdfService,
        QrCodeService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Voucher),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(VoucherGroup),
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
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
    mockDataSource = module.get<DataSource>(DataSource);
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
    voucherRepositoryMock = module.get(getRepositoryToken(Voucher));
    voucherUtils = module.get(VoucherUtils);
    orderUtils = module.get(OrderUtils);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // describe('create voucher', () => {
  //   it('should create a voucher successfully when provied valid data', async () => {
  //     // Mock
  //     const mockVoucherInput = {
  //       code: 'TEST',
  //       discount: 10,
  //       maxUsage: 10,
  //       minOrderValue: 100,
  //       slug: 'test',
  //       status: 'active',
  //       type: 'percentage',
  //       endDate: new Date(),
  //       startDate: new Date(),
  //       title: 'Test Voucher',
  //       value: 10,
  //       description: 'Test Voucher',
  //       isVerificationIdentity: false,
  //     } as CreateVoucherDto;

  //     const mockVoucherRepo = mockVoucherInput;
  //     const mockVoucherOutput = mockVoucherInput;

  //     const queryRunner = mockDataSource.createQueryRunner();
  //     mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
  //       ...queryRunner,
  //       manager: {
  //         save: jest.fn().mockResolvedValue(mockVoucherRepo),
  //       },
  //     });
  //     mapperMock.map.mockReturnValue(mockVoucherOutput);

  //     // Execute
  //     expect(await service.create(mockVoucherInput)).toEqual(mockVoucherOutput);
  //   });
  // });

  // describe('find all vouchers', () => {
  //   it('should return all vouchers successfully', async () => {
  //     // Mock
  //     const mockOptionsInput = {};
  //     const mockVouchersRepo = [
  //       {
  //         code: 'TEST',
  //         discount: 10,
  //         maxUsage: 10,
  //         minOrderValue: 100,
  //         slug: 'test',
  //         status: 'active',
  //         type: 'percentage',
  //         endDate: new Date(),
  //         startDate: new Date(),
  //         title: 'Test Voucher',
  //         value: 10,
  //         description: 'Test Voucher',
  //       },
  //     ];
  //     const mockVouchersOutput = mockVouchersRepo;

  //     voucherRepositoryMock.find.mockReturnValue(mockVouchersRepo);
  //     mapperMock.map.mockReturnValue(mockVouchersOutput);

  //     // Execute
  //     expect(await service.findAll(mockOptionsInput)).toEqual(
  //       mockVouchersOutput,
  //     );
  //   });
  // });

  describe('findone voucher', () => {
    it('should throw voucher exception when option is empty', async () => {
      // Mock
      const mockOptionInput = {} as GetVoucherDto;

      // Execute
      await expect(service.findOne(mockOptionInput)).rejects.toThrow(
        VoucherException,
      );
    });

    it('should return voucher successfully when option is provided', async () => {
      // Mock
      const mockOptionInput = {
        code: 'TEST',
        slug: 'test',
      } as GetVoucherDto;

      const mockVoucherRepo = {
        code: 'TEST',
        discount: 10,
        maxUsage: 10,
        minOrderValue: 100,
        slug: 'test',
        status: 'active',
        type: 'percentage',
        endDate: new Date(),
        startDate: new Date(),
        title: 'Test Voucher',
        value: 10,
        description: 'Test Voucher',
      };
      const mockVoucherOutput = mockVoucherRepo;

      voucherRepositoryMock.findOne.mockReturnValue(mockVoucherRepo);
      mapperMock.map.mockReturnValue(mockVoucherOutput);

      // Execute
      expect(await service.findOne(mockOptionInput)).toEqual(mockVoucherOutput);
    });
  });

  describe('update voucher', () => {
    it('should throw voucher exception when voucher is not found', async () => {
      // Mock
      const mockVoucherSlug = 'test';
      const mockUpdateVoucherDto = {} as UpdateVoucherDto;
      jest
        .spyOn(voucherUtils, 'getVoucher')
        .mockRejectedValue(
          new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND),
        );

      // Execute
      await expect(
        service.update(mockVoucherSlug, mockUpdateVoucherDto),
      ).rejects.toThrow(VoucherException);
    });

    it('should update voucher successfully when voucher is found', async () => {
      // Mock
      const mockVoucherSlug = 'test';
      const mockUpdateVoucherDto = {
        code: 'TEST Update',
        endDate: new Date(),
        maxUsage: 10,
        startDate: new Date(),
        title: 'Test Voucher',
        value: 10,
        description: 'Test Voucher',
        isActive: true,
        minOrderValue: 100,
      } as UpdateVoucherDto;

      const mockVoucherRepo = {
        code: 'TEST',
        endDate: new Date(),
        isActive: true,
        maxUsage: 10,
        minOrderValue: 100,
        slug: 'test',
        startDate: new Date(),
        remainingUsage: 10,
        title: 'Test Voucher',
        value: 10,
        description: 'Test Voucher',
      } as Voucher;
      const mockVoucherOutput = mockVoucherRepo;

      jest.spyOn(voucherUtils, 'getVoucher').mockResolvedValue(mockVoucherRepo);
      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockVoucherRepo),
        },
      });
      mapperMock.map.mockReturnValue(mockVoucherOutput);

      // Execute
      expect(
        await service.update(mockVoucherSlug, mockUpdateVoucherDto),
      ).toEqual(mockVoucherOutput);
    });
  });

  describe('delete voucher', () => {
    it('should throw voucher exception when voucher is not found', async () => {
      // Mock
      const mockVoucherSlug = 'test';
      jest
        .spyOn(voucherUtils, 'getVoucher')
        .mockRejectedValue(
          new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND),
        );

      // Execute
      await expect(service.remove(mockVoucherSlug)).rejects.toThrow(
        VoucherException,
      );
    });

    it('should deleted voucher successfully when voucher is found', async () => {
      // Mock
      const mockVoucherSlug = 'test';
      const mockVoucherRepo = {
        code: 'TEST',
        endDate: new Date(),
        isActive: true,
        maxUsage: 10,
        minOrderValue: 100,
        slug: 'test',
        startDate: new Date(),
        remainingUsage: 10,
        title: 'Test Voucher',
        value: 10,
        description: 'Test Voucher',
      } as Voucher;
      const mockVoucherOutput = mockVoucherRepo;

      jest.spyOn(voucherUtils, 'getVoucher').mockResolvedValue(mockVoucherRepo);
      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          remove: jest.fn().mockResolvedValue(mockVoucherRepo),
        },
      });
      mapperMock.map.mockReturnValue(mockVoucherOutput);

      // Execute
      expect(await service.remove(mockVoucherSlug)).toEqual(mockVoucherOutput);
    });
  });

  describe('validate voucher', () => {
    it('should throw voucher exception when voucher is not found', async () => {
      // Mock
      const mockInput = {
        user: '',
        voucher: '',
      } as ValidateVoucherDto;

      jest
        .spyOn(voucherUtils, 'getVoucher')
        .mockRejectedValue(
          new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND),
        );

      // Execute
      expect(service.validateVoucher(mockInput)).rejects.toThrow(
        VoucherException,
      );
    });

    it('should throw voucher exception when voucher is not active', async () => {
      // Mock
      const mockInput = {
        user: '',
        voucher: '',
      } as ValidateVoucherDto;

      const mockVoucherRepo = {
        code: 'TEST',
        endDate: new Date(),
        isActive: false,
        maxUsage: 10,
        minOrderValue: 100,
        slug: 'test',
        startDate: new Date(),
        remainingUsage: 10,
        title: 'Test Voucher',
        value: 10,
        description: 'Test Voucher',
      } as Voucher;

      jest.spyOn(voucherUtils, 'getVoucher').mockResolvedValue(mockVoucherRepo);

      // Execute
      expect(service.validateVoucher(mockInput)).rejects.toThrow(
        VoucherException,
      );
    });

    it('should throw voucher exception when remaining usage is 0', async () => {
      // Mock
      const mockInput = {
        user: '',
        voucher: '',
      } as ValidateVoucherDto;

      const mockVoucherRepo = {
        code: 'TEST',
        endDate: new Date(),
        isActive: true,
        maxUsage: 10,
        minOrderValue: 100,
        slug: 'test',
        startDate: new Date(),
        remainingUsage: 0,
        title: 'Test Voucher',
        value: 10,
        description: 'Test Voucher',
      } as Voucher;

      jest.spyOn(voucherUtils, 'getVoucher').mockResolvedValue(mockVoucherRepo);

      // Execute
      expect(service.validateVoucher(mockInput)).rejects.toThrow(
        VoucherException,
      );
    });

    it('should throw voucher exception when voucher is already used', async () => {
      // Mock
      const mockInput = { user: '', voucher: '' } as ValidateVoucherDto;
      const mockVoucherRepo = {
        code: 'TEST',
        endDate: new Date(),
        isActive: true,
        maxUsage: 10,
        minOrderValue: 100,
        slug: 'test',
        startDate: new Date(),
        remainingUsage: 9,
        title: 'Test Voucher',
        value: 10,
        description: 'Test Voucher',
      } as Voucher;

      const mockOrder = {
        branch: new Branch(),
        owner: new User(),
        invoice: new Invoice(),
        status: 'pending',
        slug: 'test',
        voucher: mockVoucherRepo,
        menu: new Menu(),
        quantity: 1,
        subtotal: 100,
        loss: 0,
        orderItems: [],
        payment: new Payment(),
        table: null,
        type: 'delivery',
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        chefOrders: [],
        originalSubtotal: 100,
        referenceNumber: 1,
      } as Order;

      jest.spyOn(voucherUtils, 'getVoucher').mockResolvedValue(mockVoucherRepo);
      jest.spyOn(orderUtils, 'getOrder').mockResolvedValue(mockOrder);
      jest
        .spyOn(voucherUtils, 'validateVoucherUsage')
        .mockRejectedValue(
          new VoucherException(VoucherValidation.VOUCHER_ALREADY_USED),
        );

      // Execute
      expect(service.validateVoucher(mockInput)).rejects.toThrow(
        VoucherException,
      );
    });
  });
});
