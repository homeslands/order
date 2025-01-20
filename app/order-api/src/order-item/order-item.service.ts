import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderItem } from './order-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateOrderItemRequestDto,
  OrderItemResponseDto,
} from './order-item.dto';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { OrderUtils } from 'src/order/order.utils';
import { OrderItemUtils } from './order-item.utils';
import { VariantUtils } from 'src/variant/variant.utils';
import { OrderException } from 'src/order/order.exception';
import { OrderValidation } from 'src/order/order.validation';

@Injectable()
export class OrderItemService {
  constructor(
    private readonly orderItemUtils: OrderItemUtils,
    private readonly variantUtils: VariantUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly orderUtils: OrderUtils,
  ) {}

  async deleteOrderItem(slug: string) {
    const context = `${OrderItemService.name}.${this.deleteOrderItem.name}`;
    const orderItem = await this.orderItemUtils.getOrderItem({
      where: { slug },
    });
    const { order } = orderItem;
    if (!order) {
      this.logger.warn(`Order not found in order item: ${slug}`, context);
      throw new OrderException(OrderValidation.ORDER_NOT_FOUND);
    }

    await this.transactionManagerService.execute(
      async (manager) => {
        await manager.remove(orderItem);
        // Update order
        order.subtotal = await this.orderUtils.getOrderSubtotal(order);
        await manager.save(order);
      },
      () => {
        this.logger.log(`Order item deleted: ${slug}`, context);
      },
      (error) => {
        this.logger.error(
          `Error when deleting order item: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }

  async createOrderItem(requestData: CreateOrderItemRequestDto) {
    const context = `${OrderItemService.name}.${this.createOrderItem.name}`;
    const order = await this.orderUtils.getOrder({
      where: {
        slug: requestData.order,
      },
    });
    const variant = await this.variantUtils.getVariant({
      where: {
        slug: requestData.variant,
      },
    });
    const orderItem = this.mapper.map(
      requestData,
      CreateOrderItemRequestDto,
      OrderItem,
    );
    orderItem.variant = variant;
    orderItem.order = order;
    orderItem.subtotal = await this.orderItemUtils.calculateSubTotal(orderItem);

    // Update order
    order.orderItems.push(orderItem);
    order.subtotal = await this.orderUtils.getOrderSubtotal(order);

    const createdOrderItem =
      await this.transactionManagerService.execute<OrderItem>(
        async (manager) => {
          const created = await manager.save(orderItem);
          await manager.save(order);
          return created;
        },
        (result) => {
          this.logger.log(`Order item created: ${result.id}`, context);
        },
        (error) => {
          this.logger.error(
            `Error when creating order item: ${error.mesage}`,
            error.stack,
            context,
          );
        },
      );

    return this.mapper.map(createdOrderItem, OrderItem, OrderItemResponseDto);
  }
}
