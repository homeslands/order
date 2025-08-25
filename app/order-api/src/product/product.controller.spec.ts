import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {
  CreateProductRequestDto,
  GetProductRequestDto,
  ProductResponseDto,
  UpdateProductRequestDto,
} from './product.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { CatalogResponseDto } from 'src/catalog/catalog.dto';
import { ProductException } from './product.exception';
import ProductValidation from './product.validation';
import { CatalogException } from 'src/catalog/catalog.exception';
import { CatalogValidation } from 'src/catalog/catalog.validation';
import { MenuUtils } from 'src/menu/menu.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Menu } from 'src/menu/menu.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { OrderUtils } from 'src/order/order.utils';
import { UserUtils } from 'src/user/user.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Voucher } from 'src/voucher/voucher.entity';
import { Order } from 'src/order/order.entity';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { User } from 'src/user/user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { ProductUtils } from './product.utils';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';
import { Product } from './product.entity';
import { PaymentUtils } from 'src/payment/payment.utils';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { Payment } from 'src/payment/entity/payment.entity';
import { Invoice } from 'src/invoice/invoice.entity';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        MenuUtils,
        VoucherUtils,
        OrderUtils,
        UserUtils,
        MenuItemUtils,
        TransactionManagerService,
        ProductUtils,
        PaymentUtils,
        BankTransferStrategy,
        ACBConnectorClient,
        ConfigService,
        HttpService,
        SystemConfigService,
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: repositoryMockFactory,
        },
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Voucher),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(VoucherProduct),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: ProductService,
          useValue: {
            createProduct: jest.fn(),
            getAllProducts: jest.fn(),
            updateProduct: jest.fn(),
            deleteProduct: jest.fn(),
            getAllProductsPagination: jest.fn(),
          },
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
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create product', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error if productService.createProduct throws', async () => {
      const mockInput = {
        name: 'Mock product name',
        description: 'Description of product',
        isLimit: false,
        catalog: 'mock-catalog-slug',
      } as CreateProductRequestDto;

      (service.createProduct as jest.Mock).mockRejectedValue(
        new ProductException(ProductValidation.PRODUCT_NAME_EXIST),
      );

      await expect(controller.createProduct(mockInput)).rejects.toThrow(
        ProductException,
      );
    });

    it('should return result when create success', async () => {
      const mockInput = {
        name: 'Mock product name',
        description: 'Description of product',
        isLimit: false,
        catalog: 'mock-catalog-slug',
      } as CreateProductRequestDto;
      const mockOutput = {
        slug: 'mock-product-slug',
        name: 'Mock product name',
        description: 'Description of product',
        createdAt: new Date().toString(),
        isActive: false,
        isLimit: false,
        catalog: new CatalogResponseDto(),
        variants: [],
      } as ProductResponseDto;

      (service.createProduct as jest.Mock).mockResolvedValue(mockOutput);
      const result = await controller.createProduct(mockInput);

      expect(result.result).toEqual(mockOutput);
    });
  });

  describe('Get all products', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a array of products', async () => {
      const query: GetProductRequestDto = {
        catalog: 'mock-catalog-slug',
        promotion: 'mock-promotion-slug',
        page: 0,
        size: 0,
        sort: [],
      };
      const product: ProductResponseDto = {
        slug: 'mock-product-slug',
        name: 'Mock product name',
        description: 'Description of product',
        createdAt: new Date().toString(),
        isActive: false,
        isLimit: false,
        catalog: new CatalogResponseDto(),
        variants: [],
        isTopSell: false,
        isNew: false,
        saleQuantityHistory: 0,
        isCombo: false,
      };
      const mockOutput = {
        items: [product],
        total: 1,
        page: 0,
        pageSize: 10,
        totalPages: 1,
        hasNext: false,
        hasPrevios: false,
      };

      (service.getAllProductsPagination as jest.Mock).mockResolvedValue(
        mockOutput,
      );

      const result = await controller.getAllProductsWithPagination(query);
      expect(result.result).toEqual(mockOutput);
    });

    it('should return error when service.getAllCatalogs throws', async () => {
      const query: GetProductRequestDto = {
        catalog: 'mock-catalog-slug',
        promotion: 'mock-promotion-slug',
        page: 0,
        size: 0,
        sort: [],
      };
      (service.getAllProductsPagination as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(
        controller.getAllProductsWithPagination(query),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Update product', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update success and return updated product', async () => {
      const slug: string = 'mock-product-slug';
      const mockInput = {
        name: 'Mock product name',
        description: 'The description of product',
        isLimit: false,
        isActive: false,
        catalog: 'mock-catalog-slug',
      } as UpdateProductRequestDto;

      const mockOutput = {
        slug: 'mock-product-slug',
        name: 'Mock product name',
        description: 'The description of product',
        createdAt: new Date().toString(),
        isActive: false,
        isLimit: false,
        catalog: new CatalogResponseDto(),
        variants: [],
      } as ProductResponseDto;
      (service.updateProduct as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.updateProduct(slug, mockInput);
      expect(result.result).toEqual(mockOutput);
    });

    it('should throw bad request when service.updateProduct throws', async () => {
      const slug: string = 'mock-product-slug';
      const mockInput = {
        name: 'Mock product name',
        description: 'The description of product',
        isLimit: false,
        isActive: false,
        catalog: 'mock-catalog-slug',
      } as UpdateProductRequestDto;

      (service.updateProduct as jest.Mock).mockRejectedValue(
        new CatalogException(CatalogValidation.CATALOG_NOT_FOUND),
      );

      await expect(controller.updateProduct(slug, mockInput)).rejects.toThrow(
        CatalogException,
      );
      expect(service.updateProduct).toHaveBeenCalled();
    });
  });

  describe('Delete product', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete success and return number of deleted records', async () => {
      const slug: string = 'mock-product-slug';
      (service.deleteProduct as jest.Mock).mockResolvedValue(1);

      await controller.deleteProduct(slug);
      expect(service.deleteProduct).toHaveBeenCalledTimes(1);
    });

    it('should throw error when service.deleteProduct throws', async () => {
      const slug: string = 'mock-catalog-slug';

      (service.deleteProduct as jest.Mock).mockRejectedValue(
        new ProductException(ProductValidation.PRODUCT_NOT_FOUND),
      );

      await expect(controller.deleteProduct(slug)).rejects.toThrow(
        ProductException,
      );
      expect(service.deleteProduct).toHaveBeenCalled();
    });
  });
});
