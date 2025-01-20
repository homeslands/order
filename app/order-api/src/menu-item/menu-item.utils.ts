import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { MenuItemException } from './menu-item.exception';
import { MenuItemValidation } from './menu-item.validation';
import { Order } from 'src/order/order.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MenuUtils } from 'src/menu/menu.utils';
import { OrderValidation } from 'src/order/order.validation';
import { OrderException } from 'src/order/order.exception';

@Injectable()
export class MenuItemUtils {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly menuUtils: MenuUtils,
  ) {}

  async getMenuItem(options: FindOneOptions<MenuItem>): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({ ...options });
    if (!menuItem)
      throw new MenuItemException(MenuItemValidation.MENU_ITEM_NOT_FOUND);
    return menuItem;
  }

  /**
   * Get list of current menu items
   * @param {Order} entity
   * @returns {Promise<MenuItem[]>} List of current menu items
   */
  async getCurrentMenuItems(
    entity: Order,
    date: Date,
    action: 'increment' | 'decrement',
  ): Promise<MenuItem[]> {
    const context = `${MenuItemUtils.name}.${this.getCurrentMenuItems.name}`;
    this.logger.log(
      `Get current of menu items for order: ${entity.slug}`,
      context,
    );

    this.logger.log(`Retrieve the menu for: ${date}`, context);

    // Get current menu
    const menu = await this.menuUtils.getMenu({
      where: {
        branch: {
          id: entity.branch?.id,
        },
        date,
      },
    });

    // Get unique products with quantity in order
    const uniqueProducts = new Map<string, number>();
    entity.orderItems.forEach((orderItem) => {
      const productId = orderItem.variant.product.id;
      if (!uniqueProducts.has(productId)) {
        uniqueProducts.set(productId, orderItem.quantity);
      } else {
        uniqueProducts.set(
          productId,
          uniqueProducts.get(productId) + orderItem.quantity,
        );
      }
    });

    // Get all menu items base on unique products
    const menuItems = menu.menuItems
      .filter((menuItem) => {
        return uniqueProducts.has(menuItem.product.id);
      })
      .map((menuItem) => {
        if (action === 'increment') {
          const quantity = uniqueProducts.get(menuItem.product.id);
          menuItem.currentStock += quantity;
          return menuItem;
        }
        // Decrement current stock
        const requestQuantity = uniqueProducts.get(menuItem.product.id);
        if (requestQuantity > menuItem.currentStock) {
          this.logger.warn(
            OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY.message,
            context,
          );
          throw new OrderException(
            OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY,
          );
        }
        menuItem.currentStock -= requestQuantity;
        return menuItem;
      });

    this.logger.log(
      `Menu items: ${menuItems.map((item) => item.product.name).join(', ')}`,
      context,
    );
    return menuItems;
  }
}
