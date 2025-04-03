import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { IsNull, Repository } from 'typeorm';
import {
  CreateNotificationDto,
  GetAllNotificationDto,
  NotificationResponseDto,
} from './notification.dto';
import { Notification } from './notification.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { UserUtils } from 'src/user/user.utils';
import { NotificationException } from './notification.exception';
import { NotificationValidation } from './notification.validation';
import { AppPaginatedResponseDto } from 'src/app/app.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly userUtils: UserUtils,
  ) {}

  /**
   * Read a notification
   * @param {string} slug - The slug of the notification
   * @returns {Promise<NotificationResponseDto>} The notification
   */
  async readNotification(slug: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { slug: slug ?? IsNull() },
    });

    if (!notification) {
      throw new NotificationException(
        NotificationValidation.NOTIFICATION_NOT_FOUND,
      );
    }

    notification.isRead = true;
    const result = await this.notificationRepository.save(notification);

    return this.mapper.map(result, Notification, NotificationResponseDto);
  }

  /**
   * Create a new notification
   * @param {CreateNotificationDto} data - The data of the notification
   * @returns {Promise<Notification>} The created notification
   */
  async create(data: CreateNotificationDto): Promise<Notification> {
    const context = `${Notification.name}.${this.create.name}`;
    const notification = this.mapper.map(
      data,
      CreateNotificationDto,
      Notification,
    );

    return this.transactionManagerService.execute<Notification>(
      async (manager) => {
        return await manager.save(notification);
      },
      (result) => {
        this.logger.log(`Notification created: ${result.id}`, context);
      },
      (error) => {
        this.logger.error(
          `Error creating notification: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }

  /**
   * Get all notifications
   * @param {GetAllNotificationDto} options - The options for the query
   * @returns {Promise<AppPaginatedResponseDto<NotificationResponseDto>>} The notifications
   */
  async findAll(
    options: GetAllNotificationDto,
  ): Promise<AppPaginatedResponseDto<NotificationResponseDto>> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .orderBy('notification.createdAt', 'DESC')
      .limit(options.size)
      .offset((options.page - 1) * options.size);

    if (options.receiver) {
      const receiver = await this.userUtils.getUser({
        where: { slug: options.receiver },
      });
      query.andWhere('notification.receiverId = :receiverId', {
        receiverId: receiver.id,
      });
    }

    if (options.isRead) {
      query.andWhere('notification.isRead = :isRead', {
        isRead: options.isRead,
      });
    }

    if (options.type) {
      query.andWhere('notification.type = :type', {
        type: options.type,
      });
    }

    const notifications = await query.getMany();

    const total = await query.getCount();
    const totalPages = Math.ceil(total / options.size);
    const hasNext = options.page < totalPages;
    const hasPrevious = options.page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: this.mapper.mapArray(
        notifications,
        Notification,
        NotificationResponseDto,
      ),
      total,
      page: options.page,
      pageSize: options.size,
      totalPages,
    } as AppPaginatedResponseDto<NotificationResponseDto>;
  }
}
