import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class OrderItemScheduler {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  // @Timeout(1000)
  // async initOriginalSubtotal() {
  //   const context = `${OrderItemScheduler.name}.${this.initOriginalSubtotal.name}`;
  //   const orderItems = await this.orderItemRepository.find({
  //     relations: ['promotion'],
  //   });
  //   const updatedOrderItems: OrderItem[] = [];
  //   for (const orderItem of orderItems) {
  //     let subNumber = 100 - (orderItem.promotion?.value ?? 100);
  //     if (subNumber === 0) subNumber = 100;
  //     orderItem.originalSubtotal = (orderItem.subtotal * 100) / subNumber;
  //     updatedOrderItems.push(orderItem);
  //   }
  //   await this.orderItemRepository.save(updatedOrderItems);
  //   this.logger.log(
  //     `Init original subtotal for ${orderItems.length} order items`,
  //     context,
  //   );
  //   this.eventEmitter.emit(OrderAction.INIT_ORDER_ITEM_SUCCESS);
  // }

  // @Timeout(1000)
  // async initDiscountTypeForExistedOrderItem() {
  //   const context = `${OrderItemScheduler.name}.${this.initDiscountTypeForExistedOrderItem.name}`;
  //   const orderItems = await this.orderItemRepository.find({
  //     where: {
  //       discountType: DiscountType.NONE,
  //     },
  //     relations: ['promotion'],
  //   });
  //   const updatedOrderItems: OrderItem[] = [];
  //   for (const orderItem of orderItems) {
  //     if (orderItem.promotion) {
  //       orderItem.discountType = DiscountType.PROMOTION;
  //       updatedOrderItems.push(orderItem);
  //     }
  //   }
  //   await this.transactionManagerService.execute<void>(
  //     async (manager) => {
  //       await manager.save(updatedOrderItems);
  //     },
  //     () => {
  //       this.logger.log(
  //         `Init discount type for ${updatedOrderItems.length} order item success`,
  //         context,
  //       );
  //     },
  //     (error) => {
  //       this.logger.error(
  //         `Error updating order item: ${error.message}`,
  //         context,
  //       );
  //     },
  //   );
  // }
}
