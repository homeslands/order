export const CREATE_NOTIFICATION_JOB = 'create-notification';

export enum NotificationType {
  ORDER = 'order',
}

export enum NotificationMessageCode {
  ORDER_NEEDS_PROCESSED = 'order-needs-processed',
  ORDER_NEEDS_DELIVERED = 'order-needs-delivered',
  ORDER_NEEDS_CANCELLED = 'order-needs-cancelled',
  ORDER_NEEDS_READY_TO_GET = 'order-needs-ready-to-get',
}
