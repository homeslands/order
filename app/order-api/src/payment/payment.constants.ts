export const PaymentMethod = {
  BANK_TRANSFER: 'bank-transfer',
  CASH: 'cash',
  // INTERNAL: 'internal',
  POINT: 'point',
  CREDIT_CARD: 'credit-card',
};

export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const PaymentAction = {
  PAYMENT_PAID: 'payment.paid',
  CARD_ORDER_PAYMENT_PAID: 'card-order-payment.paid',
};

export const ModeCancelQRBankTransfer = {
  APPLY: 'apply',
  NOT_APPLY: 'not-apply',
};
