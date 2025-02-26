import { Test, TestingModule } from '@nestjs/testing';
import { SizeController } from './size.controller';
import { SizeService } from './size.service';
import {
  CreateSizeRequestDto,
  SizeResponseDto,
  UpdateSizeRequestDto,
} from './size.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('SizeController', () => {
  let controller: SizeController;
  let service: SizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SizeController],
      providers: [
        SizeService,
        {
          provide: SizeService,
          useValue: {
            createSize: jest.fn(),
            getAllSizes: jest.fn(),
            updateSize: jest.fn(),
            deleteSize: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SizeController>(SizeController);
    service = module.get<SizeService>(SizeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create size', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error if sizeService.createSize throws', async () => {
      const mockInput = {
        name: 'Mock size name',
        description: 'Description of size',
      } as CreateSizeRequestDto;

      (service.createSize as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.createSize(mockInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return result when create success', async () => {
      const mockInput = {
        name: 'Mock size name',
        description: 'Description of size',
      } as CreateSizeRequestDto;
      const mockOutput = {
        slug: 'mock-size-slug',
        name: 'Mock size name',
        description: 'Description of size',
        createdAt: new Date().toString(),
      } as SizeResponseDto;

      (service.createSize as jest.Mock).mockResolvedValue(mockOutput);
      const result = await controller.createSize(mockInput);

      expect(result.result).toEqual(mockOutput);
    });
  });

  describe('Get all sizes', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a array of sizes', async () => {
      const size = {
        slug: 'mock-size-slug',
        name: 'Mock size name',
        description: 'Description of size',
        createdAt: new Date().toString(),
      } as SizeResponseDto;
      const mockOutput = [size];

      (service.getAllSizes as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.getAllSizes();
      expect(result.result).toEqual(mockOutput);
    });

    it('should return error when service.getAllSizes throws', async () => {
      (service.getAllSizes as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.getAllSizes()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(service.getAllSizes).toHaveBeenCalled();
    });
  });

  describe('Update size', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update success and return updated size', async () => {
      const slug: string = 'mock-size-slug';
      const mockInput = {
        name: 'Mock size name',
        description: 'The description of size',
      } as UpdateSizeRequestDto;

      const mockOutput = {
        slug: 'mock-size-slug',
        name: 'Mock size name',
        description: 'The description of size',
        createdAt: new Date().toString(),
      } as SizeResponseDto;
      (service.updateSize as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.updateSize(slug, mockInput);
      expect(result.result).toEqual(mockOutput);
    });

    it('should throw bad request when service.updateSize throws', async () => {
      const slug: string = 'mock-size-slug';
      const mockInput = {
        name: 'Mock size name',
        description: 'The description of size',
      } as UpdateSizeRequestDto;

      (service.updateSize as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.updateSize(slug, mockInput)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Delete catalog', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete success and return number of deleted records', async () => {
      const slug: string = 'mock-size-slug';
      (service.deleteSize as jest.Mock).mockResolvedValue(1);

      await controller.deleteSize(slug);
      expect(service.deleteSize).toHaveBeenCalledTimes(1);
    });

    it('should throw error when service.deleteSize throws', async () => {
      const slug: string = 'mock-size-slug';

      (service.deleteSize as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.deleteSize(slug)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.deleteSize).toHaveBeenCalled();
    });
  });
});
