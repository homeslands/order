import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { ProductService } from './product.service';
import { DataSource, Repository } from 'typeorm';
import { Product } from './product.entity';
import { Variant } from 'src/variant/variant.entity';
import { Mapper } from '@automapper/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { Catalog } from 'src/catalog/catalog.entity';
import {
  CreateProductRequestDto,
  GetProductRequestDto,
  UpdateProductRequestDto,
} from './product.dto';
import { Size } from 'src/size/size.entity';
import { FileService } from 'src/file/file.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { File } from 'src/file/file.entity';
import { ProductException } from './product.exception';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { CatalogException } from 'src/catalog/catalog.exception';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
import { BranchUtils } from 'src/branch/branch.utils';
import { Branch } from 'src/branch/branch.entity';

describe('ProductService', () => {
  let service: ProductService;
  let productRepositoryMock: MockType<Repository<Product>>;
  let variantRepositoryMock: MockType<Repository<Variant>>;
  let catalogRepositoryMock: MockType<Repository<Catalog>>;
  let mapperMock: MockType<Mapper>;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        FileService,
        PromotionUtils,
        MenuUtils,
        BranchUtils,
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
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Promotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ApplicablePromotion),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Variant),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(File),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Catalog),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Size),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console, // Mock logger (or a custom mock)
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    fileService = module.get<FileService>(FileService);
    productRepositoryMock = module.get(getRepositoryToken(Product));
    variantRepositoryMock = module.get(getRepositoryToken(Variant));
    catalogRepositoryMock = module.get(getRepositoryToken(Catalog));
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when product name already exists', async () => {
      const mockInput: CreateProductRequestDto = {
        name: 'Mock product name',
        isLimit: false,
        catalog: 'mock-catalog-slug',
      };

      const product: Product = {
        name: 'Mock product name',
        isActive: false,
        isLimit: false,
        catalog: new Catalog(),
        variants: [],
        menuItems: [],
        id: 'mock-product-id',
        slug: 'mock-product-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
        productAnalyses: [],
        isTopSell: false,
        isNew: false,
        saleQuantityHistory: 0,
        productChefAreas: [],
      };

      (productRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(product);
      await expect(service.createProduct(mockInput)).rejects.toThrow(
        ProductException,
      );
    });

    it('should throw error when catalog is not found', async () => {
      const mockInput: CreateProductRequestDto = {
        name: 'Mock product name',
        isLimit: false,
        catalog: 'mock-catalog-slug',
      };

      (productRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);
      (catalogRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.createProduct(mockInput)).rejects.toThrow(
        CatalogException,
      );
    });

    it('should create success and return created product', async () => {
      const mockInput: CreateProductRequestDto = {
        name: 'Mock product name',
        isLimit: false,
        catalog: 'mock-catalog-slug',
      };

      const catalog = {
        id: 'mock-catalog-slug',
        name: 'Mock catalog name',
        description: 'description for catalog',
        slug: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Catalog;

      const mockOutput = {
        name: 'Mock product name',
        isActive: false,
        isLimit: false,
        catalog: new Catalog(),
        id: 'mock-product-id',
        slug: 'mock-product-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;

      (productRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);
      (catalogRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(catalog);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      (productRepositoryMock.create as jest.Mock).mockReturnValue(mockOutput);
      (productRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);

      const result = await service.createProduct(mockInput);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('getAllProducts', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get all product success and return product array', async () => {
      const query: GetProductRequestDto = {
        catalog: 'mock-catalog-slug',
        page: 0,
        size: 0,
        sort: ['createdAt', 'desc'],
      };
      const product = {
        name: 'Mock product name',
        isActive: false,
        isLimit: false,
        catalog: new Catalog(),
        id: 'mock-product-id',
        slug: 'mock-product-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;

      const mockOutput = [product];

      (catalogRepositoryMock.find as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.mapArray as jest.Mock).mockReturnValue(mockOutput);

      const result = await service.getAllProducts(query);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('updateProduct', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when product is not found', async () => {
      const productSlug = 'mock-product-slug';
      const mockInput = {
        name: 'Mock product name',
        isLimit: false,
        isActive: false,
        catalog: 'mock-catalog-slug',
      } as UpdateProductRequestDto;

      (productRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateProduct(productSlug, mockInput),
      ).rejects.toThrow(ProductException);
    });

    it('should throw error when catalog is not found', async () => {
      const productSlug = 'mock-product-slug';
      const mockInput = {
        name: 'Mock product name',
        isLimit: false,
        isActive: false,
        catalog: 'mock-catalog-slug',
      } as UpdateProductRequestDto;

      const product = {
        name: 'Mock product name',
        isActive: false,
        isLimit: false,
        catalog: new Catalog(),
        id: 'mock-product-id',
        slug: 'mock-product-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;

      (productRepositoryMock.findOneBy as jest.Mock).mockImplementationOnce(
        () => product,
      );
      (productRepositoryMock.findOneBy as jest.Mock).mockImplementationOnce(
        () => null,
      );
      (catalogRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateProduct(productSlug, mockInput),
      ).rejects.toThrow(CatalogException);
    });

    it('should update success and return updated product', async () => {
      const productSlug = 'mock-product-slug';
      const mockInput = {
        name: 'Mock product name',
        isLimit: false,
        isActive: false,
        catalog: 'mock-catalog-slug',
      } as UpdateProductRequestDto;

      const mockOutput = {
        name: 'Mock product name',
        isActive: false,
        isLimit: false,
        catalog: new Catalog(),
        id: 'mock-product-id',
        slug: 'mock-product-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;

      const catalog = {
        id: 'mock-catalog-slug',
        name: 'Mock catalog name',
        description: 'description for catalog',
        slug: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Catalog;

      (productRepositoryMock.findOneBy as jest.Mock).mockImplementationOnce(
        () => mockOutput,
      );
      (productRepositoryMock.findOneBy as jest.Mock).mockImplementationOnce(
        () => null,
      );
      (catalogRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(catalog);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      (productRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);

      const result = await service.updateProduct(productSlug, mockInput);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('deleteProduct', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('it should throw error when product is not found', async () => {
      const productSlug = 'mock-product-slug';
      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteProduct(productSlug)).rejects.toThrow(
        ProductException,
      );
    });

    it('it should delete success', async () => {
      const productSlug = 'mock-product-slug';
      const variant = {
        price: 0,
        size: new Size(),
        product: new Product(),
        id: 'mock-variant-id',
        slug: 'mock-variant-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Variant;
      const product = {
        name: 'Mock product name',
        isActive: false,
        isLimit: false,
        catalog: new Catalog(),
        id: 'mock-product-id',
        slug: 'mock-product-slug',
        variants: [variant],
        menuItems: [],
        productChefAreas: [],
        productAnalyses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;
      const mockOutput = { affected: 1 };

      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(product);
      (productRepositoryMock.softDelete as jest.Mock).mockResolvedValue(
        mockOutput,
      );
      jest
        .spyOn(service, 'deleteVariantsRelatedProduct')
        .mockResolvedValue(undefined);

      const result = await service.deleteProduct(productSlug);
      expect(result).toEqual(mockOutput.affected);
      expect(service.deleteVariantsRelatedProduct).toHaveBeenCalled();
    });
  });

  describe('deleteVariantsRelatedProduct', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should not perform deletion when variant array is empty', async () => {
      const mockInput = [] as Variant[];
      expect(await service.deleteVariantsRelatedProduct(mockInput)).toEqual(
        undefined,
      );
      expect(variantRepositoryMock.softDelete).not.toHaveBeenCalled();
    });

    it('should not perform deletion when variant array is not empty', async () => {
      const variant = {
        price: 0,
        size: new Size(),
        product: new Product(),
        id: 'mock-variant-id',
        slug: 'mock-variant-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Variant;
      const mockInput = [variant];
      (variantRepositoryMock.softDelete as jest.Mock).mockResolvedValue(
        undefined,
      );
      expect(await service.deleteVariantsRelatedProduct(mockInput)).toEqual(
        undefined,
      );
      expect(variantRepositoryMock.softDelete).toHaveBeenCalled();
    });
  });

  describe('deleteProductImage - delete a image of product', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw exception when product not found', async () => {
      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteProductImage('mock-product-slug', 'mock-name-image'),
      ).rejects.toThrow(ProductException);
    });

    it('should delete success', async () => {
      const product = {
        name: '',
        images: JSON.stringify(['mock-name-image-1', 'mock-name-image-2']),
      } as Product;

      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(product);

      expect(
        await service.deleteProductImage(
          'mock-product-slug',
          'mock-name-image-1',
        ),
      ).toEqual(1);
    });
  });

  describe('uploadMultiProductImages - upload a image for images property', () => {
    it('should throw exception when product not found', async () => {
      const mockFile = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        destination: '',
        filename: 'mock-name-image-add',
        path: '',
        buffer: undefined,
      } as Express.Multer.File;
      const mockFiles = [mockFile];

      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.uploadMultiProductImages('mock-product-slug', mockFiles),
      ).rejects.toThrow(ProductException);
    });

    it('should upload success', async () => {
      const product = {
        name: '',
      } as Product;
      const mockFile = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        destination: '',
        filename: 'mock-name-image-add',
        path: '',
        buffer: undefined,
      } as Express.Multer.File;
      const mockFiles = [mockFile];
      const file = {
        name: '',
        extension: '',
        mimetype: '',
        data: '',
        size: 0,
        id: '',
        slug: '',
      } as File;
      const files = [file];

      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(product);
      (fileService.handleDuplicateFilesName as jest.Mock).mockReturnValue(
        mockFiles,
      );
      (fileService.uploadFiles as jest.Mock).mockResolvedValue(files);
      (productRepositoryMock.save as jest.Mock).mockResolvedValue(product);
      (mapperMock.map as jest.Mock).mockReturnValue(product);

      expect(
        await service.uploadMultiProductImages('mock-product-slug', mockFiles),
      ).toEqual(product);
    });
  });
});
