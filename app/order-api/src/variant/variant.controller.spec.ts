import { Test, TestingModule } from '@nestjs/testing';
import { VariantController } from './variant.controller';
import { VariantService } from './variant.service';
import {
  CreateVariantRequestDto,
  UpdateVariantRequestDto,
  VariantResponseDto,
} from './variant.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { SizeResponseDto } from 'src/size/size.dto';
import { ProductResponseDto } from 'src/product/product.dto';
import { VariantException } from './variant.exception';
import { VariantValidation } from './variant.validation';
import { SizeException } from 'src/size/size.exception';
import { SizeValidation } from 'src/size/size.validation';

describe('VariantController', () => {
  let controller: VariantController;
  let service: VariantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariantController],
      providers: [
        VariantService,
        {
          provide: VariantService,
          useValue: {
            createVariant: jest.fn(),
            getAllVariants: jest.fn(),
            updateVariant: jest.fn(),
            deleteVariant: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VariantController>(VariantController);
    service = module.get<VariantService>(VariantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create variant', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error if service.createVariant throws', async () => {
      const mockInput = {
        price: 0,
        size: 'mock-size-slug',
        product: 'mock-product-slug',
      } as CreateVariantRequestDto;

      (service.createVariant as jest.Mock).mockRejectedValue(
        new SizeException(SizeValidation.SIZE_NOT_FOUND),
      );

      await expect(controller.createVariant(mockInput)).rejects.toThrow(
        SizeException,
      );
    });

    it('should return result when create success', async () => {
      const mockInput = {
        price: 0,
        size: 'mock-size-slug',
        product: 'mock-product-slug',
      } as CreateVariantRequestDto;
      const mockOutput = {
        price: 0,
        size: new SizeResponseDto(),
        product: new ProductResponseDto(),
        createdAt: new Date().toString(),
        slug: 'mock-variant-slug',
      } as VariantResponseDto;

      (service.createVariant as jest.Mock).mockResolvedValue(mockOutput);
      const result = await controller.createVariant(mockInput);

      expect(result.result).toEqual(mockOutput);
    });
  });

  describe('Get all variants', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a array of variants', async () => {
      const productSlug = 'mock-product-slug';
      const variant: VariantResponseDto = {
        price: 0,
        size: new SizeResponseDto(),
        product: new ProductResponseDto(),
        createdAt: new Date().toString(),
        slug: 'mock-variant-slug',
      };
      const mockOutput = [variant];

      (service.getAllVariants as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.getAllVariants(productSlug);
      expect(result.result).toEqual(mockOutput);
    });

    it('should return error when service.getAllVariants throws', async () => {
      const productSlug = 'mock-product-slug';
      (service.getAllVariants as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.getAllVariants(productSlug)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(service.getAllVariants).toHaveBeenCalled();
    });
  });

  describe('Update variant', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update success and return updated variant', async () => {
      const slug: string = 'mock-variant-slug';
      const mockInput = {
        price: 0,
      } as UpdateVariantRequestDto;

      const mockOutput = {
        price: 0,
        size: new SizeResponseDto(),
        product: new ProductResponseDto(),
        createdAt: new Date().toString(),
        slug: 'mock-variant-slug',
      } as VariantResponseDto;

      (service.updateVariant as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.updateVariant(slug, mockInput);
      expect(result.result).toEqual(mockOutput);
    });

    it('should throw bad request when service.updateVariant throws', async () => {
      const slug: string = 'mock-variant-slug';
      const mockInput: UpdateVariantRequestDto = {
        price: 0,
      };

      (service.updateVariant as jest.Mock).mockRejectedValue(
        new VariantException(VariantValidation.VARIANT_NOT_FOUND),
      );

      await expect(controller.updateVariant(slug, mockInput)).rejects.toThrow(
        VariantException,
      );
      expect(service.updateVariant).toHaveBeenCalled();
    });
  });

  describe('Delete variant', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete success and return number of deleted records', async () => {
      const slug: string = 'mock-variant-slug';
      (service.deleteVariant as jest.Mock).mockResolvedValue(1);

      await controller.deleteVariant(slug);
      expect(service.deleteVariant).toHaveBeenCalledTimes(1);
    });

    it('should throw error when service.deleteVariant throws', async () => {
      const slug: string = 'mock-variant-slug';

      (service.deleteVariant as jest.Mock).mockRejectedValue(
        new VariantException(VariantValidation.VARIANT_NOT_FOUND),
      );

      await expect(controller.deleteVariant(slug)).rejects.toThrow(
        VariantException,
      );
      expect(service.deleteVariant).toHaveBeenCalled();
    });
  });
});
