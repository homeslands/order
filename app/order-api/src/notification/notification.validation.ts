import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND';
export const SENDER_NOT_FOUND = 'SENDER_NOT_FOUND';
export const RECEIVER_NOT_FOUND = 'RECEIVER_NOT_FOUND';
export type TNotificationErrorCodeKey =
  | typeof NOTIFICATION_NOT_FOUND
  | typeof SENDER_NOT_FOUND
  | typeof RECEIVER_NOT_FOUND;
export type TNotificationErrorCode = Record<
  TNotificationErrorCodeKey,
  TErrorCodeValue
>;

// 155501- 156000
export const NotificationValidation: TNotificationErrorCode = {
  NOTIFICATION_NOT_FOUND: createErrorCode(155501, 'Notification not found'),
  SENDER_NOT_FOUND: createErrorCode(155502, 'Sender not found'),
  RECEIVER_NOT_FOUND: createErrorCode(155503, 'Receiver not found'),
};
