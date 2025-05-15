import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND';

export type TNotificationErrorCodeKey = typeof NOTIFICATION_NOT_FOUND;

export type TNotificationErrorCode = Record<
  TNotificationErrorCodeKey,
  TErrorCodeValue
>;

// 155501- 156000
export const NotificationValidation: TNotificationErrorCode = {
  NOTIFICATION_NOT_FOUND: createErrorCode(155501, 'Notification not found'),
};
