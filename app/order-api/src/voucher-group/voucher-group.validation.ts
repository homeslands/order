import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';
export const VOUCHER_GROUP_NOT_FOUND = 'VOUCHER_GROUP_NOT_FOUND';
export const VOUCHER_GROUP_ALREADY_EXISTS = 'VOUCHER_GROUP_ALREADY_EXISTS';
export type TVoucherGroupErrorCodeKey =
  | typeof VOUCHER_GROUP_NOT_FOUND
  | typeof VOUCHER_GROUP_ALREADY_EXISTS;
export type TVoucherGroupErrorCode = Record<
  TVoucherGroupErrorCodeKey,
  TErrorCodeValue
>;

// 157001  – 157500
export const VoucherGroupValidation: TVoucherGroupErrorCode = {
  VOUCHER_GROUP_NOT_FOUND: createErrorCode(157001, 'Voucher group not found'),
  VOUCHER_GROUP_ALREADY_EXISTS: createErrorCode(
    157002,
    'Voucher group already exists',
  ),
};
