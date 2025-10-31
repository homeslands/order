import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as admin from 'firebase-admin';
import { FirebaseSendNotificationDto, FirebaseTokenDto } from './firebase.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly FirebaseProjectId: string = this.configService.get<string>(
    'FIREBASE_PROJECT_ID',
  );
  private readonly FirebaseClientEmail: string = this.configService.get<string>(
    'FIREBASE_CLIENT_EMAIL',
  );
  private readonly FirebasePrivateKey: string = this.configService.get<string>(
    'FIREBASE_PRIVATE_KEY',
  );

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    const context = `${FirebaseService.name}.${this.onModuleInit.name}`;
    try {
      const serviceAccount = {
        projectId: this.FirebaseProjectId,
        clientEmail: this.FirebaseClientEmail,
        privateKey: this.FirebasePrivateKey?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin initialized successfully', context);
    } catch (error) {
      this.logger.error(
        `Firebase Admin initialization failed with error: ${error.message}`,
        error.stack,
        context,
      );
    }
  }

  /**
   * Send notification to all platforms (web, iOS, Android)
   * @param {Array<{ token: string; platform: 'ios' | 'android' | 'web' }>} tokens - The tokens of the devices
   * @param {Object} notification - The notification object
   * @returns {Promise<{ success: boolean; successCount: number; failureCount: number; failedTokens: string[] }>} The result of the send
   */
  async sendToAllPlatforms(
    tokens: Array<FirebaseTokenDto>,
    notification: FirebaseSendNotificationDto,
  ) {
    const context = `${FirebaseService.name}.${this.sendToAllPlatforms.name}`;
    if (!tokens || tokens.length === 0) {
      this.logger.warn('No tokens to send', context);
      return { success: false, message: 'No tokens' };
    }

    try {
      const messages: admin.messaging.Message[] = tokens.map(
        ({ token, platform }) => {
          const baseMessage: admin.messaging.Message = {
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: notification.data || {},
            token: token,
          };

          // Platform-specific config
          if (platform === 'web') {
            baseMessage.webpush = {
              notification: {
                icon: '/logo192.png',
                badge: '/badge.png',
                requireInteraction: false,
              },
              fcmOptions: {
                link: notification.link || '/',
              },
            };
          } else if (platform === 'android') {
            baseMessage.android = {
              priority: 'high',
              notification: {
                channelId: 'default',
                sound: 'default',
                clickAction: notification.link,
              },
            };
          } else if (platform === 'ios') {
            baseMessage.apns = {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                  contentAvailable: true,
                },
              },
              fcmOptions: {
                imageUrl: notification.data?.imageUrl,
              },
            };
          }

          return baseMessage;
        },
      );

      const response = await admin.messaging().sendEach(messages);

      this.logger.log(
        `Sent ${response.successCount}/${tokens.length} notifications`,
      );

      const failedTokens = response.responses
        .map((resp, idx) => (resp.success ? null : tokens[idx].token))
        .filter((token) => token !== null);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    } catch (error) {
      this.logger.error('FCM send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to a device
   * @param {string} token - The token of the device
   * @param {Object} notification - The notification object
   * @returns {Promise<{ success: boolean; messageId: string }>} The result of the send
   */
  async sendToDevice(
    tokenDto: FirebaseTokenDto,
    notification: FirebaseSendNotificationDto,
  ) {
    const context = `${FirebaseService.name}.${this.sendToDevice.name}`;
    try {
      const message: admin.messaging.Message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        token: tokenDto.token,
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error('Send to device error', error.stack, context);

      // Check if token is invalid
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return {
          success: false,
          shouldDeleteToken: true,
          error: error.message,
        };
      }

      return { success: false, error: error.message };
    }
  }
}
