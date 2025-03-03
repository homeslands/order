import { Size } from 'src/size/size.entity';
import { VariantService } from './variant.service';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { Repository } from 'typeorm';
import { Product } from 'src/product/product.entity';
import { Variant } from './variant.entity';
import { Mapper } from '@automapper/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import {
  CreateVariantRequestDto,
  UpdateVariantRequestDto,
} from './variant.dto';
import { Catalog } from 'src/catalog/catalog.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { SizeException } from 'src/size/size.exception';
import { ProductException } from 'src/product/product.exception';
import { VariantException } from './variant.exception';

describe('VariantService', () => {
  let service: VariantService;
  let productRepositoryMock: MockType<Repository<Product>>;
  let variantRepositoryMock: MockType<Repository<Variant>>;
  let sizeRepositoryMock: MockType<Repository<Size>>;
  let mapperMock: MockType<Mapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariantService,
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Variant),
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
          useValue: console,
        },
      ],
    }).compile();

    service = module.get<VariantService>(VariantService);
    productRepositoryMock = module.get(getRepositoryToken(Product));
    variantRepositoryMock = module.get(getRepositoryToken(Variant));
    sizeRepositoryMock = module.get(getRepositoryToken(Size));
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVariant', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when size is not found', async () => {
      const mockInput = {
        price: 0,
        size: 'mock-size-slug',
        product: 'mock-product-slug',
      } as CreateVariantRequestDto;

      (sizeRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.createVariant(mockInput)).rejects.toThrow(
        SizeException,
      );
    });

    it('should throw error when product is not found', async () => {
      const mockInput = {
        price: 0,
        size: 'mock-size-slug',
        product: 'mock-product-slug',
      } as CreateVariantRequestDto;

      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.createVariant(mockInput)).rejects.toThrow(
        ProductException,
      );
    });

    it('should throw error when the both of product and size does exists', async () => {
      const mockInput = {
        price: 0,
        size: 'mock-size-slug',
        product: 'mock-product-slug',
      } as CreateVariantRequestDto;

      const size = {
        name: 'Mock size name',
        id: 'mock-size-id',
        slug: 'mock-size-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Size;

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

      const variant = {
        size: new Size(),
        product: new Product(),
        price: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 'mock-variant-id',
        slug: 'mock-variant-slug',
      } as Variant;

      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(product);
      (sizeRepositoryMock.findOne as jest.Mock).mockResolvedValue(size);
      (variantRepositoryMock.findOne as jest.Mock).mockResolvedValue(variant);
      await expect(service.createVariant(mockInput)).rejects.toThrow(
        VariantException,
      );
    });

    it('should create success and return created product', async () => {
      const mockInput = {
        price: 0,
        size: 'mock-size-slug',
        product: 'mock-product-slug',
      } as CreateVariantRequestDto;

      const size = {
        name: 'Mock size name',
        id: 'mock-size-id',
        slug: 'mock-size-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Size;

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

      const mockOutput = {
        size: new Size(),
        product: new Product(),
        price: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 'mock-variant-id',
        slug: 'mock-variant-slug',
      } as Variant;

      (productRepositoryMock.findOne as jest.Mock).mockResolvedValue(product);
      (sizeRepositoryMock.findOne as jest.Mock).mockResolvedValue(size);
      (variantRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);
      (variantRepositoryMock.create as jest.Mock).mockReturnValue(mockOutput);
      (variantRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockImplementationOnce(() => mockOutput);

      const result = await service.createVariant(mockInput);
      expect(result).toEqual(mockOutput);
      expect(mapperMock.map).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllVariants', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get success and return all variants', async () => {
      const productSlug: string = 'mock-product-slug';
      const variant = {
        size: new Size(),
        product: new Product(),
        price: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 'mock-variant-id',
        slug: 'mock-variant-slug',
      } as Variant;
      const mockOutput = [variant];
      (variantRepositoryMock.find as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.mapArray as jest.Mock).mockReturnValue(mockOutput);

      const result = await service.getAllVariants(productSlug);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('updateVariants', () => {
    it('should throw error when variant is not found', async () => {
      const variantSlug = 'mock-variant-slug';
      const mockInput = {
        price: 0,
      } as UpdateVariantRequestDto;
      (variantRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateVariant(variantSlug, mockInput),
      ).rejects.toThrow(VariantException);
    });

    it('should update success and return updated variant', async () => {
      const variantSlug = 'mock-variant-slug';
      const mockInput = {
        price: 0,
      } as UpdateVariantRequestDto;
      const mockOutput = {
        price: 0,
        size: new Size(),
        product: new Product(),
        id: 'mock-variant-id',
        slug: 'mock-variant-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Variant;

      (variantRepositoryMock.findOne as jest.Mock).mockResolvedValue(
        mockOutput,
      );
      (variantRepositoryMock.save as jest.Mock).mockResolvedValue(mockOutput);
      (mapperMock.map as jest.Mock).mockReturnValue(mockOutput);

      const result = await service.updateVariant(variantSlug, mockInput);
      expect(result).toEqual(mockOutput);
    });
  });

  describe('deleteVariant', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when variant is not found', async () => {
      const variantSlug = 'mock-variant-slug';
      (variantRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteVariant(variantSlug)).rejects.toThrow(
        VariantException,
      );
    });

    it('should delete success and return number of deleted records', async () => {
      const variantSlug = 'mock-variant-slug';
      const variant = {
        price: 0,
        size: new Size(),
        product: new Product(),
        id: 'mock-variant-id',
        slug: 'mock-variant-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Variant;
      const mockOut = { affected: 1 };

      (variantRepositoryMock.findOneBy as jest.Mock).mockResolvedValue(variant);
      (variantRepositoryMock.softDelete as jest.Mock).mockResolvedValue(
        mockOut,
      );

      expect(await service.deleteVariant(variantSlug)).toEqual(
        mockOut.affected,
      );
    });
  });
});
