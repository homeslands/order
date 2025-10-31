import { Injectable } from '@nestjs/common';
import { NotificationMessageCode } from '../notification.constants';

@Injectable()
export class NotificationLanguageService {
  private messages = {
    vi: {
      [NotificationMessageCode.ORDER_NEEDS_PROCESSED]: {
        title: 'Đơn hàng cần xử lý',
        body: 'Đơn hàng #{{referenceNumber}} cần xử lý. Vui lòng xử lý sớm!',
      },
      [NotificationMessageCode.ORDER_NEEDS_DELIVERED]: {
        title: 'Đơn hàng cần giao',
        body: 'Đơn hàng #{{referenceNumber}} cần giao. Vui lòng giao hàng sớm!',
      },
      [NotificationMessageCode.ORDER_NEEDS_CANCELLED]: {
        title: 'Đơn hàng đã hủy',
        body: 'Đơn hàng #{{referenceNumber}} đã được hủy.',
      },
      [NotificationMessageCode.ORDER_NEEDS_READY_TO_GET]: {
        title: 'Đơn hàng sẵn sàng',
        body: 'Đơn hàng #{{referenceNumber}} đã sẵn sàng. Vui lòng tới quầy để nhận!',
      },
    },
    en: {
      [NotificationMessageCode.ORDER_NEEDS_PROCESSED]: {
        title: 'Order needs processed',
        body: 'Order #{{referenceNumber}} needs to be processed. Please process it quickly!',
      },
      [NotificationMessageCode.ORDER_NEEDS_DELIVERED]: {
        title: 'Order needs delivered',
        body: 'Order #{{referenceNumber}} needs to be delivered. Please deliver it quickly!',
      },
      [NotificationMessageCode.ORDER_NEEDS_CANCELLED]: {
        title: 'Order is cancelled',
        body: 'Order #{{referenceNumber}} is cancelled.',
      },
      [NotificationMessageCode.ORDER_NEEDS_READY_TO_GET]: {
        title: 'Order needs ready to get',
        body: 'Order #{{referenceNumber}} is ready to get. Please get it quickly!',
      },
    },
  };

  /**
   * Format notification message by language
   * @param {string} messageCode - The message code
   * @param {Record<string, any>} params - The parameters
   * @param {string} language - The language
   * @returns {string} The formatted message
   */
  format(
    messageCode: string,
    params: Record<string, any>,
    language: string = 'vi',
  ): { title: string; body: string } {
    const lang = language in this.messages ? language : 'vi';
    const template = this.messages[lang]?.[messageCode];

    if (!template) {
      return {
        title: 'Notification',
        body: messageCode,
      };
    }

    // Replace {{param}} with the actual value
    let title = template.title;
    let body = template.body;

    Object.keys(params).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      title = title.replace(regex, params[key]?.toString() || '');
      body = body.replace(regex, params[key]?.toString() || '');
    });

    return { title, body };
  }
}
