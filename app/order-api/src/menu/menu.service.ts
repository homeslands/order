import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Between, FindOptionsWhere, Like, Repository } from 'typeorm';
import {
  CreateMenuDto,
  GetAllMenuQueryRequestDto,
  GetMenuRequestDto,
  MenuResponseDto,
  UpdateMenuDto,
} from './menu.dto';
import { Branch } from 'src/branch/branch.entity';
import { MenuValidation } from './menu.validation';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { MenuException } from './menu.exception';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as _ from 'lodash';
import { getDayIndex } from 'src/helper';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   *
   * @param {string} slug
   * @returns {Promise<MenuResponseDto>} New menu created successfully
   * @throws {MenuException} Menu not found
   */
  async restoreMenu(slug: string): Promise<MenuResponseDto> {
    const context = `${MenuService.name}.${this.restoreMenu.name}`;
    const menu = await this.menuRepository.findOne({
      where: { slug },
      withDeleted: true,
    });
    if (!menu) {
      this.logger.warn(`Menu ${slug} not found`, context);
      throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    }

    const restored = await this.menuRepository.recover(menu);
    return this.mapper.map(restored, Menu, MenuResponseDto);
  }

  /**
   * Handles retrieve specific menu
   *
   * This method retrieves a specific menu based on the query
   *
   * @param {GetMenuRequestDto} query
   * @returns {Promise<MenuResponseDto>} The specific menu was retrieved
   * @throws {MenuException} Menu not found
   */
  async getMenu(query: GetMenuRequestDto): Promise<MenuResponseDto> {
    const context = `${MenuService.name}.${this.getMenu.name}`;

    if (_.isEmpty(query)) {
      this.logger.warn(`Query is empty`, context);
      throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    }

    const findOptionsWhere: FindOptionsWhere<Menu> = {
      slug: query.slug,
      date: query.date,
      branch: { slug: query.branch },
    };

    if (query.productName)
      findOptionsWhere.menuItems = {
        product: {
          name: Like(`%${query.productName}%`),
        },
      };

    if (query.catalog) {
      findOptionsWhere.menuItems = {
        product: {
          catalog: {
            slug: query.catalog,
          },
        },
      };
    }

    if (query.minPrice && query.maxPrice) {
      findOptionsWhere.menuItems = {
        product: {
          variants: {
            price: Between(query.minPrice, query.maxPrice),
          },
        },
      };
    }

    const menu = await this.menuRepository.findOne({
      where: findOptionsWhere,
      relations: [
        'menuItems.product.variants.size',
        'menuItems.product.catalog',
      ],
      order: {
        menuItems: {
          product: {
            variants: {
              price: 'ASC',
            },
          },
        },
      },
    });

    if (!menu) {
      this.logger.warn(`Menu not found`, context);
      throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    }

    return this.mapper.map(menu, Menu, MenuResponseDto);
  }

  /**
   * @param {string} slug
   * @returns {Promise<boolean>} Menu soft deleted successfully if return true
   * @throws {MenuException} Menu not found
   */
  async deleteMenu(slug: string): Promise<number> {
    const menu = await this.menuRepository.findOne({ where: { slug } });
    if (!menu) throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    const deleted = await this.menuRepository.softDelete(menu.id);
    return deleted.affected;
  }

  /**
   * @param {string} slug
   * @param {UpdateMenuDto} requestData
   * @returns {Promise<MenuResponseDto>} Menu updated successfully
   * @throws {MenuException} Invalid branch slug
   */
  async updateMenu(
    slug: string,
    requestData: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    const context = `${MenuService.name}.${this.updateMenu.name}`;
    const menu = await this.menuRepository.findOne({
      where: { slug },
      relations: ['branch'],
    });
    if (!menu) {
      this.logger.error(`Menu ${slug} not found`, null, context);
      throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    }

    const branch = await this.branchRepository.findOne({
      where: { slug: requestData.branchSlug },
    });
    if (!branch) {
      this.logger.error(
        `Branch ${requestData.branchSlug} not found`,
        null,
        context,
      );
      throw new BranchException(BranchValidation.INVALID_BRANCH_SLUG);
    }

    // Check if template menu already exist
    if (requestData.isTemplate) {
      const dayIndex = getDayIndex(requestData.date);
      const isExsitTemplate = await this.menuRepository.findOne({
        where: { branch: { id: branch.id }, dayIndex, isTemplate: true },
      });
      if (isExsitTemplate) {
        this.logger.warn(
          `Template menu for ${requestData.date} already exist`,
          context,
        );
        throw new MenuException(MenuValidation.TEMPLATE_EXIST);
      }
    }

    Object.assign(menu, { ...requestData, branch });
    const updatedMenu = await this.menuRepository.save(menu);
    this.logger.log(`Menu ${slug} updated`, context);

    return this.mapper.map(updatedMenu, Menu, MenuResponseDto);
  }

  /**
   *
   * @param {CreateMenuDto} requestData
   * @returns {Promise<MenuResponseDto>} New menu created successfully
   * @throws {MenuException} Invalid branch slug
   */
  async createMenu(requestData: CreateMenuDto): Promise<MenuResponseDto> {
    const context = `${MenuService.name}.${this.createMenu.name}`;
    const branch = await this.branchRepository.findOne({
      where: { slug: requestData.branchSlug },
    });
    if (!branch) {
      this.logger.warn(`Branch ${requestData.branchSlug} not found`, context);
      throw new BranchException(BranchValidation.INVALID_BRANCH_SLUG);
    }

    // Check if template menu already exist
    if (requestData.isTemplate) {
      const dayIndex = getDayIndex(requestData.date);
      const isExsitTemplate = await this.menuRepository.findOne({
        where: { branch: { id: branch.id }, dayIndex, isTemplate: true },
      });
      if (isExsitTemplate) {
        this.logger.warn(
          `Template menu for ${requestData.date} already exist`,
          context,
        );
        throw new MenuException(MenuValidation.TEMPLATE_EXIST);
      }
    }

    const menu = this.mapper.map(requestData, CreateMenuDto, Menu);
    Object.assign(menu, { branch });

    this.menuRepository.create(menu);
    const createdMenu = await this.menuRepository.save(menu);
    this.logger.log(`New menu created: ${createdMenu.slug}`, context);

    return this.mapper.map(createdMenu, Menu, MenuResponseDto);
  }

  /**
   *
   * @param {any} query
   * @returns {Promise<MenuResponseDto[]>} All menus retrieved successfully
   */
  async getAllMenus(
    query: GetAllMenuQueryRequestDto,
  ): Promise<AppPaginatedResponseDto<MenuResponseDto>> {
    const [menus, total] = await this.menuRepository.findAndCount({
      where: { branch: { slug: query.branch }, isTemplate: query.isTemplate },
      order: { date: 'DESC' },
      relations: ['menuItems.product.variants.size'],
      skip: (query.page - 1) * query.size,
      take: query.size,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / query.size);
    // Determine hasNext and hasPrevious
    const hasNext = query.page < totalPages;
    const hasPrevious = query.page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: this.mapper.mapArray(menus, Menu, MenuResponseDto),
      total,
      page: query.page,
      pageSize: query.size,
      totalPages,
    } as AppPaginatedResponseDto<MenuResponseDto>;
  }
}
