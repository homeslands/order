import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  ApprovalUserResponseDto,
  CreateOrderRequestDto,
  GetOrderRequestDto,
  OrderPaymentResponseDto,
  OrderResponseDto,
  OwnerResponseDto,
} from './order.dto';
import { BadRequestException } from '@nestjs/common';
import { InvoiceResponseDto } from 'src/invoice/invoice.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import ProductValidation from 'src/product/product.validation';
import { ProductException } from 'src/product/product.exception';
import { Payment } from 'src/payment/entity/payment.entity';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { PaymentUtils } from 'src/payment/payment.utils';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrinterJob } from 'src/printer/entity/printer-job.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { AccumulatedPointService } from 'src/accumulated-point/accumulated-point.service';
import { AccumulatedPoint } from 'src/accumulated-point/entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from 'src/accumulated-point/entities/accumulated-point-transaction-history.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/user/user.entity';
import { Order } from './order.entity';
import { CurrentUserDto } from 'src/user/user.dto';
import { RoleEnum } from 'src/role/role.enum';
import { GoogleMapConnectorClient } from 'src/google-map/google-map-connector.client';
import { BranchConfig } from 'src/branch-config/branch-config.entity';
import { BranchConfigService } from 'src/branch-config/branch-config.service';
import { Branch } from 'src/branch/branch.entity';
import { GoogleMapService } from 'src/google-map/google-map.service';
import { FeatureFlagSystemService } from 'src/feature-flag-system/feature-flag-system.service';
import { FeatureFlagSystem } from 'src/feature-flag-system/entities/feature-flag-system.entity';
import { ChildFeatureFlagSystem } from 'src/feature-flag-system/entities/child-feature-flag-system.entity';
import { FeatureSystemGroup } from 'src/feature-flag-system/entities/feature-system-group.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        SystemConfigService,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
            getAllOrders: jest.fn(),
            getOrderBySlug: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
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
        {
          provide: getRepositoryToken(PrinterJob),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: repositoryMockFactory,
        },
        AccumulatedPointService,
        {
          provide: getRepositoryToken(AccumulatedPoint),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(AccumulatedPointTransactionHistory),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMockFactory,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(), // Mock the emit method
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: repositoryMockFactory,
        },
        GoogleMapConnectorClient,
        BranchConfigService,
        {
          provide: getRepositoryToken(BranchConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: repositoryMockFactory,
        },
        GoogleMapService,
        FeatureFlagSystemService,
        {
          provide: getRepositoryToken(FeatureFlagSystem),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(FeatureSystemGroup),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChildFeatureFlagSystem),
          useValue: repositoryMockFactory,
        },
        TransactionManagerService,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create order', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error if service.createOrder throws', async () => {
      const mockInput = {
        type: '',
        table: '',
        branch: '',
        owner: '',
        orderItems: [],
      } as CreateOrderRequestDto;
      const mockCurrentUser = {
        scope: {
          role: RoleEnum.Customer,
        },
      } as CurrentUserDto;
      (service.createOrder as jest.Mock).mockRejectedValue(
        new ProductException(ProductValidation.PRODUCT_NAME_EXIST),
      );
      await expect(
        controller.createOrder(mockInput, mockCurrentUser),
      ).rejects.toThrow(ProductException);
    });

    it('should return result when create success', async () => {
      const mockInput = {
        type: '',
        table: '',
        branch: '',
        owner: '',
        orderItems: [],
      } as CreateOrderRequestDto;

      const mockCurrentUser = {
        scope: {
          role: RoleEnum.Staff,
        },
      } as CurrentUserDto;

      const mockOutput = {
        subtotal: 0,
        status: '',
        type: '',
        tableName: '',
        owner: new OwnerResponseDto(),
        approvalBy: new ApprovalUserResponseDto(),
        orderItems: [],
        payment: new OrderPaymentResponseDto(),
        createdAt: '',
        slug: '',
      } as OrderResponseDto;

      (service.createOrder as jest.Mock).mockResolvedValue(mockOutput);
      expect(
        (await controller.createOrder(mockInput, mockCurrentUser)).result,
      ).toEqual(mockOutput);
    });
  });

  describe('Get all orders', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return array of order when get success', async () => {
      const mockInput = {
        branch: '',
        owner: '',
        page: 0,
        size: 0,
        status: [],
      } as GetOrderRequestDto;
      const order = {
        subtotal: 0,
        status: '',
        type: '',
        tableName: '',
        owner: new OwnerResponseDto(),
        approvalBy: new ApprovalUserResponseDto(),
        orderItems: [],
        payment: new OrderPaymentResponseDto(),
        createdAt: '',
        slug: '',
        invoice: new InvoiceResponseDto(),
      } as OrderResponseDto;
      const mockOutput = [order];
      (service.getAllOrders as jest.Mock).mockResolvedValue(mockOutput);
      expect((await controller.getAllOrders(mockInput)).result).toEqual(
        mockOutput,
      );
    });
  });

  describe('Get specific order by slug', () => {
    it('should throw error when service.getOrderBySlug throws', async () => {
      const slug: string = '';

      (service.getOrderBySlug as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );
      await expect(controller.getOrder(slug)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return order data when get success', async () => {
      const slug: string = '';

      const mockOutput = {
        subtotal: 0,
        status: '',
        type: '',
        tableName: '',
        owner: new OwnerResponseDto(),
        approvalBy: new ApprovalUserResponseDto(),
        orderItems: [],
        payment: new OrderPaymentResponseDto(),
        createdAt: '',
        slug: '',
      } as OrderResponseDto;

      (service.getOrderBySlug as jest.Mock).mockResolvedValue(mockOutput);
      expect((await controller.getOrder(slug)).result).toEqual(mockOutput);
    });
  });
});
