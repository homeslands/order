import { Inject, Injectable, Logger } from '@nestjs/common';
import { RoleEnum } from 'src/role/role.enum';
import {
  NotificationMessageCode,
  NotificationType,
} from './notification.contanst';
import { NotificationProducer } from './notification.producer';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/order/order.entity';
import { UserException } from 'src/user/user.exception';
import { UserValidation } from 'src/user/user.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NotificationException } from './notification.exception';
import { NotificationValidation } from './notification.validation';
import { isDefinedCustomer } from 'src/auth/auth.utils';

@Injectable()
export class NotificationUtils {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationProducer: NotificationProducer,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async sendNotificationAfterOrderIsPaid(order: Order) {
    // Get all chef role users in the same branch
    const chefRoleUsers = await this.userRepository.find({
      where: {
        role: {
          name: RoleEnum.Chef,
        },
        branch: {
          id: order.branch.id,
        },
      },
    });

    const notificationData = chefRoleUsers.map((user) => ({
      message: NotificationMessageCode.ORDER_NEEDS_PROCESSED,
      receiverId: user.id,
      receiverName: `${user.firstName} ${user.lastName}`,
      type: NotificationType.ORDER,
      metadata: {
        order: order.slug,
        orderType: order.type,
        tableName: order.table?.name,
        table: order.table?.slug,
        branchName: order.branch?.name,
        branch: order.branch?.slug,
      },
    }));

    // Send notification to all chef role users in the same branch
    await this.notificationProducer.bulkCreateNotification(notificationData);
  }

  async sendNotificationAfterOrderIsProcessed(order: Order) {
    // Create notification to send to staffs in the same branch
    const staffs = await this.userRepository.find({
      where: {
        role: {
          name: RoleEnum.Staff,
        },
        branch: {
          id: order.branch?.id,
        },
      },
    });

    const notificationData = staffs.map((staff) => ({
      message: NotificationMessageCode.ORDER_NEEDS_DELIVERED,
      receiverId: staff.id,
      type: NotificationType.ORDER,
      receiverName: `${staff.firstName} ${staff.lastName}`,
      metadata: {
        order: order?.slug,
        orderType: order?.type,
        tableName: order?.table?.name,
        table: order?.table?.slug,
        branchName: order?.branch?.name,
        branch: order?.branch?.slug,
      },
    }));

    await this.notificationProducer.bulkCreateNotification(notificationData);
  }

  async sendNotificationForCustomerToGetOrder(
    createdById: string,
    order: Order,
  ) {
    const context = `${NotificationUtils.name}.${this.sendNotificationForCustomerToGetOrder.name}`;
    // Create notification to send to staffs in the same branch
    const customer = await this.userRepository.findOne({
      where: {
        id: order.owner.id,
      },
      relations: { role: true },
    });

    if (!customer) {
      this.logger.error(UserValidation.USER_NOT_FOUND, context);
      throw new UserException(UserValidation.USER_NOT_FOUND);
    }

    if (!isDefinedCustomer(customer)) {
      this.logger.error(NotificationValidation.RECEIVER_NOT_FOUND, context);
      throw new NotificationException(
        NotificationValidation.RECEIVER_NOT_FOUND,
      );
    }

    const sender = await this.userRepository.findOne({
      where: { id: createdById },
    });

    if (!sender) {
      this.logger.error(NotificationValidation.SENDER_NOT_FOUND);
      throw new NotificationException(NotificationValidation.SENDER_NOT_FOUND);
    }

    const notificationData = {
      message: NotificationMessageCode.ORDER_NEEDS_READY_TO_GET,
      receiverId: customer.id,
      type: NotificationType.ORDER,
      receiverName: `${customer.firstName} ${customer.lastName}`,
      senderId: sender.id,
      senderName: `${sender.firstName} ${sender.lastName}`,
      metadata: {
        order: order.slug,
        orderType: order.type,
        tableName: order.table?.name,
        table: order.table?.slug,
        branchName: order.branch?.name,
        branch: order.branch?.slug,
      },
    };
    await this.notificationProducer.createNotification(notificationData);
  }
}
