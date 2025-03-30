import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getDayIndex } from 'src/helper';
import { Branch } from 'src/branch/branch.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import moment from 'moment';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { GENERATE_MENU_JOB } from './menu.constants';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class MenuScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly promotionUtils: PromotionUtils,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: GENERATE_MENU_JOB })
  async generateMenu() {
    const context = `${MenuScheduler.name}.${this.generateMenu.name}`;
    const today = new Date(moment().format('YYYY-MM-DD'));
    today.setHours(7, 0, 0, 0);
    this.logger.log(`Generating menu for today = ${today}`, context);

    const dayIndex = getDayIndex(today);
    this.logger.log(`Today index: ${dayIndex}`, context);

    const branches = await this.branchRepository.find();

    // Get branches is not generated menu
    const branchSettledResults = await Promise.allSettled(
      branches.map(async (item) => {
        const menu = await this.menuRepository.findOne({
          where: { branch: { id: item.id }, isTemplate: false, date: today },
        });
        return !menu ? item : null;
      }),
    );

    const filteredBranches = branchSettledResults
      .filter((item) => item.status === 'fulfilled')
      .map((item) => item.value)
      .filter((item) => item);

    this.logger.log(
      `filtered branches count = ${filteredBranches.length}`,
      context,
    );

    // Get all template menus base on list of branches
    const templateMenus = await this.getTemplateMenus(
      filteredBranches,
      dayIndex,
    );

    const filteredMenus = templateMenus
      .filter((menu) => menu)
      .filter((menu) => {
        // Filter the menu if the menu is for today.
        const isSame = moment(menu.date).isSame(moment(today));
        return !isSame;
      });
    this.logger.log(`Template menu count = ${filteredMenus.length}`, context);

    const newMenus = await Promise.all(
      filteredMenus.map(async (menu) => {
        const menuItems = await Promise.all(
          menu.menuItems.map(async (item: MenuItem) => {
            const promotion: Promotion =
              await this.promotionUtils.getPromotionByProductAndBranch(
                today,
                menu.branch.id,
                item.product.id,
              );
            const newItem = new MenuItem();
            newItem.promotion = promotion;
            newItem.product = item.product;

            // Assign stock if product is limited
            if (item.product.isLimit) {
              newItem.defaultStock = item.defaultStock;
              newItem.currentStock = item.defaultStock;
            }

            return newItem;
          }),
        );

        // Make new menu
        const newMenu = new Menu();
        Object.assign(newMenu, {
          date: today,
          branch: menu.branch,
          menuItems,
        });
        return newMenu;
      }),
    );

    await this.transactionManagerService.execute<Menu[]>(
      async (manager) => {
        return await manager.save(newMenus);
      },
      (results) => {
        this.logger.log(
          `Menu generated [${results.map((item) => `${item.date} - ${item.branch?.name}`).join(', ')}]`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error when generating menu: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
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
    const menusSettledResults = await Promise.allSettled(
      branches.map(async (branch) => {
        const menu = await this.menuRepository.findOne({
          where: { branch: { id: branch.id }, dayIndex, isTemplate: true },
          relations: ['menuItems.product', 'branch'],
        });
        return menu;
      }),
    );

    return menusSettledResults
      .filter((item) => item.status === 'fulfilled')
      .map((item) => item.value)
      .filter((item) => item);
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
