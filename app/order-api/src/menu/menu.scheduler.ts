import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as _ from 'lodash';
import { getDayIndex } from 'src/helper';
import { Branch } from 'src/branch/branch.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class MenuScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  //   @Cron(CronExpression.EVERY_30_SECONDS)
  async generateMenu() {
    const context = `${MenuScheduler.name}.${this.generateMenu.name}`;
    const today = new Date();
    const dayIndex = getDayIndex(today);
    this.logger.log(`Generating menu for today = ${today}`, context);

    const branches = await this.branchRepository.find();
    this.logger.log(`Branch count = ${branches.length}`, context);

    const templateMenus = await this.getTemplateMenus(branches, dayIndex);
    this.logger.log(`Template menu count = ${templateMenus.length}`, context);

    const newMenus = templateMenus.map((menu) => {
      const newMenu = _.cloneDeep(menu);
      newMenu.date = today;
      newMenu.isTemplate = false;
      newMenu.id = undefined;
      Object.assign(newMenu, {
        date: today,
        isTemplate: false,
        id: undefined,
        branch: menu.branch,
        menuItems: menu.menuItems.map((item) => {
          const newItem = _.cloneDeep(item);
          newItem.id = undefined;
          newItem.currentStock = newItem.defaultStock;
          return newItem;
        }),
      });
      return newMenu;
    });
    this.menuRepository.manager.transaction(async (manager) => {
      await manager.save(newMenus);
    });
  }

  async getTemplateMenus(branches: Branch[], dayIndex: number) {
    const templateMenus = await Promise.all(
      branches
        .map(async (branch) => {
          const menu = await this.menuRepository.findOne({
            where: { branch: { id: branch.id }, dayIndex: 2, isTemplate: true },
          });
          return menu;
        })
        .filter(async (menu) => !!(await menu)),
    );
    console.log({ templateMenus });
    return templateMenus;
  }

  //   @Cron(CronExpression.EVERY_30_SECONDS)
  async updateDayIndex() {
    const context = `${MenuScheduler.name}.${this.updateDayIndex.name}`;
    this.logger.log(`Updating day index for menus without day index`, context);

    const menusWithoutDayIndex = await this.menuRepository.find({
      where: { dayIndex: null },
    });
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
