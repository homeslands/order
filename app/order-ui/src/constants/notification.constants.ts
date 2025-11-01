export enum TOKEN_CHECK_INTERVAL {
  INTERVAL = 1000 * 60 * 60 * 24, // 24 hours
}
export enum TOKEN_REFRESH_THRESHOLD {
  THRESHOLD = 1000 * 60 * 60 * 48, // 48 hours
}

export enum NotificationMessageCode {
    ORDER_NEEDS_PROCESSED = 'order-needs-processed',
    ORDER_NEEDS_DELIVERED = 'order-needs-delivered',
    ORDER_NEEDS_CANCELLED = 'order-needs-cancelled',
}

export enum MAX_RETRIES {
  MAX_RETRIES = 3,
}

export enum RETRY_DELAYS {
  RETRY_DELAY_1 = 1000,
  RETRY_DELAY_2 = 5000,
  RETRY_DELAY_3 = 15000,
}