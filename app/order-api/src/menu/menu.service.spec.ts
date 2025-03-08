import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Branch } from 'src/branch/branch.entity';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { Repository } from 'typeorm';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { Mapper } from '@automapper/core';
import { MenuException } from './menu.exception';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GetAllMenuQueryRequestDto } from './menu.dto';
import { BranchException } from 'src/branch/branch.exception';
import { MenuUtils } from './menu.utils';

describe('MenuService', () => {
  let service: MenuService;
  let menuRepositoryMock: MockType<Repository<Menu>>;
  let branchRepositoryMock: MockType<Repository<Branch>>;
  let mapperMock: MockType<Mapper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        MenuUtils,
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
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

    service = module.get<MenuService>(MenuService);
    menuRepositoryMock = module.get(getRepositoryToken(Menu));
    branchRepositoryMock = module.get(getRepositoryToken(Branch));
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get all menus', () => {
    it('should return all menus', async () => {
      // Mock input
      const mockOptions = { page: 1, size: 10 } as GetAllMenuQueryRequestDto;

      // Mock output
      const menu = {
        branch: {
          name: 'Mock branch name',
          address: 'Mock address',
          createdAt: new Date(),
          slug: 'mock-branch-slug',
        } as Branch,
        createdAt: new Date(),
        slug: 'mock-menu-slug',
      } as Menu;
      const menus = [menu];

      // Mock implementation
      menuRepositoryMock.findAndCount.mockReturnValue([menus, 1]);
      mapperMock.mapArray.mockReturnValue(menus);

      // Actual call
      const result = await service.getAllMenus(mockOptions);

      // Assertions
      expect(result.items).toEqual(menus);
    });
  });

  // describe('Get menu by slug', () => {
  //   it('should return a menu', async () => {
  //     // Mock input
  //     const mockSlug = 'mock-slug';

  //     // Mock output
  //     const menu = {
  //       day: 'Monday',
  //       branch: {
  //         name: 'Mock branch name',
  //         address: 'Mock address',
  //         createdAt: new Date(),
  //         slug: 'mock-branch-slug',
  //       } as Branch,
  //       createdAt: new Date(),
  //       slug: 'mock-menu-slug',
  //     } as Menu;

  //     // Mock implementation
  //     menuRepositoryMock.findOne.mockReturnValue(menu);
  //     mapperMock.map.mockReturnValue(menu);

  //     // Assertions
  //     expect(await service.getMenu(mockSlug)).toEqual(menu);
  //   });

  //   it('should throw an error if menu is not found', async () => {
  //     // Mock input
  //     const mockSlug = 'mock-slug';

  //     // Mock output
  //     const menu = null;

  //     // Mock implementation
  //     menuRepositoryMock.findOne.mockReturnValue(menu);

  //     // Assertions
  //     expect(service.getMenu()).rejects.toThrow(MenuException);
  //   });
  // });

  describe('Create menu', () => {
    it('should be throw an menu exception if branch is not found', async () => {
      // Mock input
      const mockMenu = {
        date: new Date(),
        branchSlug: '',
        isTemplate: false,
      };

      // Mock implementation
      branchRepositoryMock.findOne.mockReturnValue(null);

      // Assertions
      expect(service.createMenu(mockMenu)).rejects.toThrow(BranchException);
    });

    it('should create a menu', async () => {
      // Mock input
      const mockMenu = {
        date: new Date(),
        branchSlug: 'mock-branch-slug',
        isTemplate: false,
      };

      // Mock output
      const menu = {
        branch: {
          name: 'Mock branch name',
          address: 'Mock address',
          createdAt: new Date(),
          slug: 'mock-branch-slug',
        } as Branch,
        createdAt: new Date(),
        slug: 'mock-menu-slug',
      } as Menu;

      // Mock implementation
      menuRepositoryMock.create.mockReturnValue(menu);
      menuRepositoryMock.save.mockReturnValue(menu);
      mapperMock.map.mockReturnValue(menu);

      // Assertions
      expect(await service.createMenu(mockMenu)).toEqual(menu);
    });
  });

  describe('Delete menu', () => {
    it('should be throw an menu exception if menu is not found', async () => {
      // Mock input
      const mockSlug = 'mock-slug';

      // Mock implementation
      menuRepositoryMock.findOne.mockReturnValue(null);

      // Assertions
      expect(service.deleteMenu(mockSlug)).rejects.toThrow(MenuException);
    });

    it('should delete a menu', async () => {
      // Mock input
      const mockSlug = 'mock-slug';

      const menuMock = {
        day: 'Monday',
        branch: {
          name: 'Mock branch name',
          address: 'Mock address',
          createdAt: new Date(),
          slug: 'mock-branch-slug',
        } as Branch,
        createdAt: new Date(),
        slug: 'mock-menu-slug',
      };

      // Mock output
      const expectedValue = 1;

      // Mock implementation
      menuRepositoryMock.findOne.mockReturnValue(menuMock);
      menuRepositoryMock.softDelete.mockReturnValue({ affected: 1 });

      // Assertions
      expect(await service.deleteMenu(mockSlug)).toEqual(expectedValue);
    });
  });

  describe('Restore menu', () => {
    it('should be throw an menu exception if menu is not found', async () => {
      // Mock input
      const mockSlug = 'mock-slug';

      // Mock implementation
      menuRepositoryMock.findOne.mockReturnValue(null);

      // Assertions
      expect(service.restoreMenu(mockSlug)).rejects.toThrow(MenuException);
    });

    it('should restore a menu', async () => {
      // Mock input
      const mockSlug = 'mock-menu-slug';

      // Mock output
      const menuMock = {
        branch: {
          name: 'Mock branch name',
          address: 'Mock address',
          createdAt: new Date(),
          slug: 'mock-branch-slug',
        } as Branch,
        createdAt: new Date(),
        slug: 'mock-menu-slug',
      } as Menu;

      // Mock implementation
      menuRepositoryMock.findOne.mockReturnValue(menuMock);
      menuRepositoryMock.recover.mockReturnValue(menuMock);
      mapperMock.map.mockReturnValue(menuMock);

      // Assertions
      expect(await service.restoreMenu(mockSlug)).toEqual(menuMock);
    });
  });
});
