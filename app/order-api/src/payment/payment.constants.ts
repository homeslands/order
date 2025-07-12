export const PaymentMethod = {
  BANK_TRANSFER: 'bank-transfer',
  CASH: 'cash',
  INTERNAL: 'internal',
  POINT: 'point',
};

export const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const PaymentAction = {
  PAYMENT_PAID: 'payment.paid',
  CARD_ORDER_PAYMENT_PAID: 'card-order-payment.paid',
};
