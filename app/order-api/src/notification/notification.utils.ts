import { Injectable } from '@nestjs/common';
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

@Injectable()
export class NotificationUtils {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationProducer: NotificationProducer,
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
}
