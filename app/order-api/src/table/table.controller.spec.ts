import { Test, TestingModule } from '@nestjs/testing';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import {
  CreateTableRequestDto,
  TableResponseDto,
  UpdateTableRequestDto,
} from './table.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';

describe('TableController', () => {
  let controller: TableController;
  let service: TableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableController],
      providers: [
        TableService,
        SystemConfigService,
        {
          provide: TableService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            changeStatus: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
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
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<TableController>(TableController);
    service = module.get<TableService>(TableService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create table', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error if tableService.create throws', async () => {
      const mockInput = {
        name: 'Mock table name',
        branch: 'mock-branch-slug',
        location: 'mock-table-location',
      } as CreateTableRequestDto;

      (service.create as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.create(mockInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return result when create success', async () => {
      const mockInput = {
        name: 'Mock table name',
        branch: 'mock-branch-slug',
        location: 'mock-table-location',
      } as CreateTableRequestDto;

      const mockOutput = {
        name: 'Mock table name',
        location: 'mock-table-location',
        isEmpty: true,
        createdAt: new Date().toString(),
        slug: 'mock-table-slug',
        xPosition: 10,
        yPosition: 10,
        status: 'available',
      } as TableResponseDto;

      (service.create as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.create(mockInput);
      expect(result.result).toEqual(mockOutput);
    });
  });

  describe('Get all tables by branch', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a array of products', async () => {
      const branchSlug = 'mock-branch-slug';
      const table = {
        name: 'Mock table name',
        location: 'mock-table-location',
        isEmpty: true,
        createdAt: new Date().toString(),
        slug: 'mock-table-slug',
        xPosition: 10,
        yPosition: 10,
        status: 'available',
      } as TableResponseDto;
      const mockOutput = [table];

      (service.findAll as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.findAll(branchSlug);
      expect(result.result).toEqual(mockOutput);
    });

    it('should return error when tableService.findAll throws', async () => {
      const branchSlug = 'mock-branch-slug';
      (service.findAll as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.findAll(branchSlug)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('Update table', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update success and return updated table', async () => {
      const slug: string = 'mock-table-slug';
      const mockInput = {
        name: 'Mock table name',
        location: 'mock-table-location',
      } as UpdateTableRequestDto;
      const mockOutput = {
        name: 'Mock table name',
        location: 'mock-table-location',
        isEmpty: true,
        createdAt: new Date().toString(),
        slug: 'mock-table-slug',
        xPosition: 10,
        yPosition: 10,
        status: 'available',
      } as TableResponseDto;

      (service.update as jest.Mock).mockResolvedValue(mockOutput);

      const result = await controller.update(slug, mockInput);
      expect(result.result).toEqual(mockOutput);
    });

    it('should throw bad request when tableService.update throws', async () => {
      const slug: string = 'mock-product-slug';
      const mockInput = {
        name: 'Mock table name',
        location: 'mock-table-location',
      } as UpdateTableRequestDto;

      (service.update as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.update(slug, mockInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('Delete table', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete success and return number of deleted records', async () => {
      const slug: string = 'mock-table-slug';
      (service.remove as jest.Mock).mockResolvedValue(1);

      await controller.remove(slug);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw error when tableService.remove throws', async () => {
      const slug: string = 'mock-table-slug';

      (service.remove as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.remove(slug)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.remove).toHaveBeenCalled();
    });
  });
});
