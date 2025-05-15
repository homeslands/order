import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { MenuItemException } from './menu-item.exception';
import { MenuItemValidation } from './menu-item.validation';
import { Order } from 'src/order/order.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MenuUtils } from 'src/menu/menu.utils';
import { OrderValidation } from 'src/order/order.validation';
import { OrderException } from 'src/order/order.exception';
import { OrderItem } from 'src/order-item/order-item.entity';

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
        // Increment when canceling order
        if (action === 'increment') {
          if (menuItem.defaultStock !== null) {
            const quantity = uniqueProducts.get(menuItem.product.id);
            const incomingStock = menuItem.currentStock + quantity;
            // Ensure incoming stock does not exceed current stock
            if (incomingStock > menuItem.defaultStock) {
              this.logger.warn(
                OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY
                  .message,
                context,
              );
              menuItem.currentStock = menuItem.defaultStock;
            } else {
              menuItem.currentStock = incomingStock;
            }
          }

          return menuItem;
        }
        if (action === 'decrement') {
          // Decrement when create, update order
          if (menuItem.defaultStock !== null) {
            const requestQuantity = uniqueProducts.get(menuItem.product.id);
            if (requestQuantity > menuItem.currentStock) {
              this.logger.warn(
                OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY
                  .message,
                context,
              );
              throw new OrderException(
                OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY,
              );
            }
            menuItem.currentStock -= requestQuantity;
            return menuItem;
          }
        }
        return menuItem;
      });

    this.logger.log(
      `Menu items: ${menuItems.map((item) => item.product.name).join(', ')}`,
      context,
    );
    return menuItems;
  }

  async getCurrentMenuItem(
    entity: OrderItem,
    date: Date,
    action: 'increment' | 'decrement',
    requestStock: number = 1,
  ) {
    const context = `${MenuItemUtils.name}.${this.getCurrentMenuItem.name}`;
    this.logger.log(
      `Get current of menu item for order item: ${entity.slug}`,
      context,
    );

    const menu = await this.menuUtils.getMenu({
      where: {
        branch: {
          id: entity.order.branch?.id,
        },
        date,
      },
    });

    const menuItem = menu.menuItems.find(
      (item) => item.product.id === entity.variant.product.id,
    );

    if (!menuItem) {
      this.logger.warn(MenuItemValidation.MENU_ITEM_NOT_FOUND.message, context);
      throw new MenuItemException(MenuItemValidation.MENU_ITEM_NOT_FOUND);
    }

    // limit product
    switch (action) {
      // increment menu item
      case 'increment': {
        if (menuItem.defaultStock !== null) {
          const newStock = Math.min(
            menuItem.currentStock + requestStock,
            menuItem.defaultStock,
          );
          if (newStock !== menuItem.currentStock) {
            this.logger.warn(
              OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY.message,
              context,
            );
            if (newStock !== menuItem.currentStock) {
              this.logger.warn(
                OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY
                  .message,
                context,
              );
            }
            menuItem.currentStock = newStock;
          }
        }
        break;
      }

      // decrement menu item
      case 'decrement': {
        if (menuItem.defaultStock !== null) {
          if (menuItem.currentStock <= 0) {
            this.logger.warn(
              OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY.message,
              context,
            );
            throw new OrderException(
              OrderValidation.REQUEST_QUANTITY_EXCESS_CURRENT_QUANTITY,
            );
          }
          menuItem.currentStock -= requestStock;
        }
        break;
      }

      default:
        this.logger.warn(MenuItemValidation.INVALID_ACTION.message, context);
        throw new MenuItemException(MenuItemValidation.INVALID_ACTION);
    }

    this.logger.log(`Menu item: ${menuItem.product.name}`, context);
    return menuItem;
  }
}
