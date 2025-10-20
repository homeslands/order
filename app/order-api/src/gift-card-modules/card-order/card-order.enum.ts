export enum CardOrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed', // payment success
  FAIL = 'fail', // payment fail
  CANCELLED = 'cancelled',
}

export enum CardOrderType {
  SELF = 'SELF', // Nạp cho bản thân
  GIFT = 'GIFT', // Nạp cho người khác
  BUY = 'BUY', // Mua thẻ quà tặng
}
