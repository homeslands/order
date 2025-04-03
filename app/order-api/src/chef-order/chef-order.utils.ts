import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Order } from 'src/order/order.entity';
import { Product } from 'src/product/product.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { ChefOrder } from './chef-order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import _ from 'lodash';
import { ChefOrderException } from './chef-order.exception';
import ChefOrderValidation from './chef-order.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefOrderItemStatus } from 'src/chef-order-item/chef-order-item.constants';
import { ChefOrderStatus } from './chef-order.constants';
import { ChefOrderItemUtils } from 'src/chef-order-item/chef-order-item.utils';
import { OrderItem } from 'src/order-item/order-item.entity';

@Injectable()
export class ChefOrderUtils {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ChefArea)
    private readonly chefAreaRepository: Repository<ChefArea>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ChefOrder)
    private readonly chefOrderRepository: Repository<ChefOrder>,
    @InjectRepository(ChefOrderItem)
    private readonly chefOrderItemRepository: Repository<ChefOrderItem>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly chefOrderItemUtils: ChefOrderItemUtils,
  ) {}

  async getChefOrder(options: FindOneOptions<ChefOrder>): Promise<ChefOrder> {
    const context = `${ChefOrderUtils.name}.${this.getChefOrder.name}`;

    const chefOrder = await this.chefOrderRepository.findOne({ ...options });
    if (!chefOrder) {
      this.logger.warn(
        ChefOrderValidation.CHEF_ORDER_NOT_FOUND.message,
        context,
      );
      throw new ChefOrderException(ChefOrderValidation.CHEF_ORDER_NOT_FOUND);
    }

    return chefOrder;
  }

  async createChefOrder(orderId: string): Promise<ChefOrder[]> {
    const context = `${ChefOrderUtils.name}.${this.createChefOrder.name}`;
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'orderItems.variant.product.productChefAreas.chefArea.branch',
        'branch',
        'chefOrders',
      ],
    });
    const orderItems = order.orderItems;
    const chefAreaGroups = new Map<string, OrderItem[]>();
    await Promise.all(
      orderItems.map(async (orderItem) => {
        const product = await this.productRepository.findOne({
          where: { id: orderItem.variant.product.id },
          relations: ['productChefAreas.chefArea.branch'],
        });

        // get chef area
        const chefAreaList =
          product?.productChefAreas
            .map((pca) => pca.chefArea)
            .filter((chefArea) => chefArea.branch?.id === order.branch.id) ||
          [];
        if (_.size(chefAreaList) === 1) {
          const chefArea = _.first(chefAreaList);
          if (!chefAreaGroups.has(chefArea.id)) {
            chefAreaGroups.set(chefArea.id, []);
          }
          chefAreaGroups.get(chefArea.id).push(orderItem);
        } else {
          this.logger.error(
            `Product ${product.name} is be long to more one chef area in branch ${order.branch.name}`,
            null,
            context,
          );
          throw new ChefOrderException(
            ChefOrderValidation.ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA,
          );
        }
      }),
    );

    const chefOrders: ChefOrder[] = await Promise.all(
      Array.from(chefAreaGroups.entries()).map(
        async ([chefAreaId, orderItems]) => {
          const chefArea = await this.chefAreaRepository.findOne({
            where: { id: chefAreaId },
            relations: ['branch'],
          });
          const chefOrder = new ChefOrder();

          const chefOrderItems = orderItems.flatMap((orderItem) =>
            Array.from({ length: orderItem.quantity }, () =>
              this.chefOrderItemRepository.create({ orderItem }),
            ),
          );
          Object.assign(chefOrder, { order, chefArea, chefOrderItems });
          return chefOrder;
        },
      ),
    );
    const createdChefOrders = await this.chefOrderRepository.save(chefOrders);
    return createdChefOrders;
  }

  async updateChefOrderStatus(chefOrderItemSlug: string) {
    const context = `${ChefOrderUtils.name}.${this.updateChefOrderStatus.name}`;
    const chefOrderItem = await this.chefOrderItemUtils.getChefOrderItem({
      where: { slug: chefOrderItemSlug },
      relations: ['chefOrder.chefOrderItems'],
    });
    const chefOrder = chefOrderItem.chefOrder;

    try {
      const completedChefOrderItems = chefOrder.chefOrderItems.filter(
        (item) => item.status === ChefOrderItemStatus.COMPLETED,
      );

      if (
        _.size(chefOrder.chefOrderItems) === _.size(completedChefOrderItems)
      ) {
        Object.assign(chefOrder, { status: ChefOrderStatus.COMPLETED });
        await this.chefOrderRepository.save(chefOrder);
      }
    } catch (error) {
      this.logger.error(
        `Error when update status to COMPLETED for chef order: ${chefOrder.slug}`,
        error.stack,
        context,
      );
      throw new ChefOrderException(
        ChefOrderValidation.ERROR_WHEN_UPDATE_STATUS_TO_COMPLETED_FOR_CHEF_ORDER,
      );
    }
  }
}
