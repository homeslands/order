import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Order } from './order.entity';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from 'src/menu/menu.entity';
import { Repository } from 'typeorm';
import { MenuValidation } from 'src/menu/menu.validation';
import { MenuException } from 'src/menu/menu.exception';
import { OrderValidation } from './order.validation';
import { OrderException } from './order.exception';

export class OrderUtils {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  /**
   * Get list of current menu items
   * @param {Order} entity
   * @returns {Promise<MenuItem[]>} List of current menu items
   */
  async getCurrentMenuItems(
    entity: Order,
    action: 'increment' | 'decrement',
  ): Promise<MenuItem[]> {
    const context = `${OrderUtils.name}.${this.getCurrentMenuItems.name}`;
    this.logger.log(
      `Get current of menu items for order: ${entity.slug}`,
      context,
    );

    const today = new Date(moment().format('YYYY-MM-DD'));
    this.logger.log(`Retrieve the menu for today: ${today}`, context);

    // Get current menu
    const menu = await this.menuRepository.findOne({
      where: {
        branch: {
          id: entity.branch?.id,
        },
        date: today,
      },
      relations: ['menuItems', 'menuItems.product'],
    });
    if (!menu) {
      this.logger.warn(MenuValidation.MENU_NOT_FOUND.message, context);
      throw new MenuException(MenuValidation.MENU_NOT_FOUND);
    }

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
