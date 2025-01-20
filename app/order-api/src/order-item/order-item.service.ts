import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateOrderItemRequestDto,
  OrderItemResponseDto,
} from './order-item.dto';
import { Variant } from 'src/variant/variant.entity';
import { VariantException } from 'src/variant/variant.exception';
import { VariantValidation } from 'src/variant/variant.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { OrderUtils } from 'src/order/order.utils';
import { OrderItemUtils } from './order-item.utils';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly orderItemUtils: OrderItemUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly orderUtils: OrderUtils,
  ) {}

  async deleteOrderItem(slug: string) {
    const context = `${OrderItemService.name}.${this.deleteOrderItem.name}`;
    const orderItem = await this.orderItemUtils.getOrderItem({ slug });
    await this.transactionManagerService.execute(
      async (manager) => {
        await manager.remove(orderItem);
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

  async getVariant(where: FindOptionsWhere<Variant>) {
    const variant = await this.variantRepository.findOne({
      where,
    });
    if (!variant) {
      throw new VariantException(VariantValidation.VARIANT_NOT_FOUND);
    }
    return variant;
  }

  async calculateSubTotal(orderItem: OrderItem) {
    return orderItem.quantity * orderItem.variant.price;
  }

  async createOrderItem(requestData: CreateOrderItemRequestDto) {
    const context = `${OrderItemService.name}.${this.createOrderItem.name}`;
    const order = await this.orderUtils.getOrder({ slug: requestData.order });
    const variant = await this.getVariant({ slug: requestData.variant });
    const orderItem = this.mapper.map(
      requestData,
      CreateOrderItemRequestDto,
      OrderItem,
    );
    orderItem.variant = variant;
    orderItem.order = order;
    orderItem.subtotal = await this.calculateSubTotal(orderItem);
    order.orderItems.push(orderItem);

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
