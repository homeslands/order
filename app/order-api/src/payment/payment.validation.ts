import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PAYMENT_QUERY_INVALID = 'PAYMENT_QUERY_INVALID';
export const PAYMENT_METHOD_INVALID = 'PAYMENT_METHOD_INVALID';
export const PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND';
export const TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND';
export const ONLY_BANK_TRANSFER_CAN_EXPORT = 'ONLY_BANK_TRANSFER_CAN_EXPORT';
export const INITIATE_PUBLIC_PAYMENT_DENIED = 'INITIATE_PUBLIC_PAYMENT_DENIED';
export const ROLE_NOT_ALLOWED_TO_INITIATE_PAYMENT =
  'ROLE_NOT_ALLOWED_TO_INITIATE_PAYMENT';
export const CUSTOMER_ONLY_USE_BANK_TRANSFER =
  'CUSTOMER_ONLY_USE_BANK_TRANSFER';
export type TPaymentErrorCodeKey =
  | typeof PAYMENT_QUERY_INVALID
  | typeof PAYMENT_NOT_FOUND
  | typeof TRANSACTION_NOT_FOUND
  | typeof PAYMENT_METHOD_INVALID
  | typeof ONLY_BANK_TRANSFER_CAN_EXPORT
  | typeof INITIATE_PUBLIC_PAYMENT_DENIED
  | typeof ROLE_NOT_ALLOWED_TO_INITIATE_PAYMENT
  | typeof CUSTOMER_ONLY_USE_BANK_TRANSFER;

export type TPaymentErrorCode = Record<TPaymentErrorCodeKey, TErrorCodeValue>;

// 123000 - 124000
export const PaymentValidation: TPaymentErrorCode = {
  PAYMENT_QUERY_INVALID: createErrorCode(123000, 'Payment query is invalid'),
  PAYMENT_METHOD_INVALID: createErrorCode(123001, 'Payment method is invalid'),
  PAYMENT_NOT_FOUND: createErrorCode(123002, 'Payment not found'),
  TRANSACTION_NOT_FOUND: createErrorCode(123003, 'Payment not found'),
  ONLY_BANK_TRANSFER_CAN_EXPORT: createErrorCode(
    123004,
    'Only bank transfer can export',
  ),
  INITIATE_PUBLIC_PAYMENT_DENIED: createErrorCode(
    123005,
    'Initiate public payment denied',
  ),
  ROLE_NOT_ALLOWED_TO_INITIATE_PAYMENT: createErrorCode(
    123006,
    'Role not allowed to initiate payment',
  ),
  CUSTOMER_ONLY_USE_BANK_TRANSFER: createErrorCode(
    123007,
    'Customer only use bank transfer',
  ),
};
