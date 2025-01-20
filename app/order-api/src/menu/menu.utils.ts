import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { MenuException } from './menu.exception';
import { MenuValidation } from './menu.validation';

@Injectable()
export class MenuUtils {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async getMenu(options: FindOneOptions<Menu>): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      relations: ['menuItems', 'menuItems.product'],
      ...options,
    });
    if (!menu) throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    return menu;
  }
}
