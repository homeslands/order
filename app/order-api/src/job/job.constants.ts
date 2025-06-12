export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum JobType {
  UPDATE_STATUS_ORDER_AFTER_PAID = 'update-status-order-after-paid',
  UPDATE_CARD_ORDER_STATUS_AFTER_PAYMENT_PAID = 'update-card-order-status-after-payment-paid',
}
