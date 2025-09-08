export enum AccumulatedPointTransactionType {
  ADD = 'add',
  USE = 'use',
  RESERVE = 'reserve', // Temporary reserve when apply for order
  REFUND = 'refund', // Refund when order is cancelled
}

export enum AccumulatedPointTransactionStatus {
  PENDING = 'pending', // Pending (reserve)
  CONFIRMED = 'confirmed', // Confirmed (actually subtract/add points)
  CANCELLED = 'cancelled', // Cancelled - Points will be returned
}
