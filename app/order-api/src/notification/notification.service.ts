import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { In, IsNull, Repository } from 'typeorm';
import {
  CreateNotificationDto,
  FirebaseRegisterDeviceTokenRequestDto,
  FirebaseRegisterDeviceTokenResponseDto,
  GetAllNotificationDto,
  NotificationResponseDto,
} from './notification.dto';
import { Notification } from './notification.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { UserUtils } from 'src/user/user.utils';
import { NotificationException } from './notification.exception';
import { NotificationValidation } from './notification.validation';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { FirebaseDeviceToken } from './firebase/firebase-device-token.entity';
import { FirebaseService } from './firebase/firebase.service';
import { FirebasePlatform } from './firebase/firebase.constant';
import {
  FirebaseSendNotificationDto,
  FirebaseTokenDto,
} from './firebase/firebase.dto';

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
    @InjectRepository(FirebaseDeviceToken)
    private readonly firebaseDeviceTokenRepository: Repository<FirebaseDeviceToken>,
    private readonly firebaseService: FirebaseService,
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

    const createdNotification =
      await this.transactionManagerService.execute<Notification>(
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
          return null;
        },
      );

    if (!createdNotification) {
      return;
    }

    // send notification to firebase fcm server
    try {
      const deviceTokens = await this.firebaseDeviceTokenRepository.find({
        where: { userId: createdNotification.receiverId },
        select: {
          id: true,
          token: true,
          platform: true,
        },
      });

      if (deviceTokens.length === 0) {
        this.logger.warn(
          `No device tokens for user ${createdNotification.receiverId}`,
          context,
        );
        return createdNotification;
      }

      const tokensWithPlatform: Array<FirebaseTokenDto> = deviceTokens.map(
        (dt) => ({
          token: dt.token,
          platform: dt.platform as FirebasePlatform,
        }),
      );

      const fcmData: FirebaseSendNotificationDto = {
        title: createdNotification.title || '',
        body: createdNotification.body || '',
        link: createdNotification.link || '',
        data: {
          slug: createdNotification.slug,
          type: createdNotification.type,
          message: createdNotification.message,
          senderId: createdNotification.senderId,
          receiverId: createdNotification.receiverId,
          createdAt: createdNotification.createdAt,
          ...(JSON.parse(createdNotification.metadata) || {}),
        },
      };

      const result = await this.firebaseService.sendToAllPlatforms(
        tokensWithPlatform,
        fcmData,
      );

      if (result.failedTokens && result.failedTokens.length > 0) {
        await this.firebaseDeviceTokenRepository.delete({
          token: In(result.failedTokens),
        });
        this.logger.warn(
          `Removed ${result.failedTokens.length} invalid tokens for user ${createdNotification.receiverId} when sending notification to firebase fcm server`,
          context,
        );
        return createdNotification;
      }

      return createdNotification;
    } catch (error) {
      this.logger.error(
        `Error when sending notification to firebase fcm server: ${error.message}`,
        error.stack,
        context,
      );
      return createdNotification;
    }
  }

  /**
   * Register device token (call this API when user login)
   * @param {string} userId - The user id
   * @param {FirebaseRegisterDeviceTokenRequestDto} data - The data of the device token
   * @returns {Promise<FirebaseRegisterDeviceTokenResponseDto>} The device token
   */
  async registerDeviceToken(
    userId: string,
    data: FirebaseRegisterDeviceTokenRequestDto,
  ): Promise<FirebaseRegisterDeviceTokenResponseDto> {
    // Check token đã tồn tại chưa
    let deviceToken = await this.firebaseDeviceTokenRepository.findOne({
      where: { token: data.token },
    });

    if (deviceToken) {
      // Update userId (trường hợp đổi account)
      deviceToken.userId = userId;
      deviceToken.platform = data.platform;
      deviceToken.userAgent = data.userAgent;
      deviceToken.updatedAt = new Date();
    } else {
      // Tạo mới
      deviceToken = this.firebaseDeviceTokenRepository.create({
        userId,
        token: data.token,
        platform: data.platform,
        userAgent: data.userAgent,
      });
    }

    const result = await this.firebaseDeviceTokenRepository.save(deviceToken);
    return this.mapper.map(
      result,
      FirebaseDeviceToken,
      FirebaseRegisterDeviceTokenResponseDto,
    );
  }

  /**
   * Delete device token (logout)
   * @param {string} token - The token of the device
   * @returns {Promise<void>} The void
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    await this.firebaseDeviceTokenRepository.delete({ token });
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
