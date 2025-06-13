export enum CardOrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed', // payment success
  FAIL = 'fail', // payment fail
  CANCELLED = 'cancelled',
}

export enum CardOrderType {
  SELF = 'SELF',
  GIFT = 'GIFT',
}
