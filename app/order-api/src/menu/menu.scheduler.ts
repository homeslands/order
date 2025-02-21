import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import * as _ from 'lodash';
import { getDayIndex } from 'src/helper';
import { Branch } from 'src/branch/branch.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import moment from 'moment';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Product } from 'src/product/product.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { ApplicablePromotionType } from 'src/applicable-promotion/applicable-promotion.constant';
import { Promotion } from 'src/promotion/promotion.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';

@Injectable()
export class MenuScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Menu) 
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Promotion) 
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(ApplicablePromotion) 
    private readonly applicablePromotionRepository: Repository<ApplicablePromotion>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly promotionUtils: PromotionUtils,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  // @Timeout(1000)
  async generateMenu() {
    const context = `${MenuScheduler.name}.${this.generateMenu.name}`;
    // check duplicate menu

    const today = new Date(moment().format('YYYY-MM-DD'));
    this.logger.log(`Generating menu for today = ${today}`, context);

    const dayIndex = getDayIndex(today);
    this.logger.log(`Today index: ${dayIndex}`, context);

    const branches = await this.branchRepository.find();
    this.logger.log(`Branch count = ${branches.length}`, context);

    // Get all template menus base on list of branches
    const templateMenus = await this.getTemplateMenus(branches, dayIndex);

    const filteredMenus = templateMenus
      .filter((menu) => menu !== null)
      .filter((menu) => {
        // Filter the menu if the menu is for today.
        const isSame = moment(menu.date).isSame(moment(today));
        return !isSame;
      });
    this.logger.log(`Template menu count = ${filteredMenus.length}`, context);

    const date = new Date();
    date.setHours(7, 0, 0, 0);
    
    const newMenus = await Promise.all(
      filteredMenus.map(async (menu) => {
        const newMenu = _.cloneDeep(menu);
        Object.assign(newMenu, {
          date: today,
          isTemplate: false,
          id: undefined,
          slug: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          deletedAt: undefined,
          branch: menu.branch,
          menuItems: await Promise.all(
            menu.menuItems.map(async (item: MenuItem) => {
              const promotion: Promotion = 
                await this.promotionUtils.getPromotionByProductAndBranch(
                  date,
                  menu.branch.id,
                  item.product.id
                );
              const newItem = _.cloneDeep(item);
              newItem.id = undefined;
              newItem.slug = undefined;
              newItem.createdAt = undefined;
              newItem.updatedAt = undefined;
              newItem.deletedAt = undefined;
              newItem.promotion = promotion;
              newItem.currentStock = newItem.defaultStock;
              newItem.product = newItem.product;
              return newItem;
            }),
          )
        });
        return newMenu;
      })
    )

    this.menuRepository.manager.transaction(async (manager) => {
      try {
        await manager.save(newMenus);
        this.logger.log(
          `Menu generated ${newMenus.map((item) => `${item.slug}, `)}`,
          context,
        );
      } catch (error) {
        this.logger.error(
          `Error when generating menu: ${error.message}`,
          error.stack,
          context,
        );
      }
    });
  }

  /**
   * Get template menus for the day
   * @param {Branch[]} branches
   * @param {number} dayIndex
   * @returns {Promise<Menu[]>} Template menus for the day
   */
  async getTemplateMenus(
    branches: Branch[],
    dayIndex: number,
  ): Promise<Menu[]> {
    const templateMenus = await Promise.all(
      branches.map(async (branch) => {
        const menu = await this.menuRepository.findOne({
          where: { branch: { id: branch.id }, dayIndex, isTemplate: true },
          relations: ['menuItems.product', 'branch'],
        });
        return menu;
      }),
    );

    return templateMenus;
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateDayIndex() {
    const context = `${MenuScheduler.name}.${this.updateDayIndex.name}`;
    this.logger.log(`Updating day index for menus without day index`, context);

    const menusWithoutDayIndex = await this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.dayIndex IS NULL')
      .getMany();
    this.logger.log(
      `Menu without day index count = ${menusWithoutDayIndex.length}`,
      context,
    );

    const updatedMenus = menusWithoutDayIndex.map((item) => {
      const dayIndex = getDayIndex(item.date);
      item.dayIndex = dayIndex;
      return item;
    });

    this.menuRepository.manager.transaction(async (manager) => {
      await manager.save(updatedMenus);
      this.logger.log(`Day index updated`, context);
    });
  }
}
