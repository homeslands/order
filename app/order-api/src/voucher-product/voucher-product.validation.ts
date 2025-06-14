import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const VOUCHER_PRODUCT_NOT_FOUND = 'VOUCHER_PRODUCT_NOT_FOUND';
export const VOUCHER_PRODUCT_ALREADY_EXISTS = 'VOUCHER_PRODUCT_ALREADY_EXISTS';
export const FIND_ONE_VOUCHER_PRODUCT_FAILED =
  'FIND_ONE_VOUCHER_PRODUCT_FAILED';

export type TVoucherProductErrorCodeKey =
  | typeof VOUCHER_PRODUCT_NOT_FOUND
  | typeof VOUCHER_PRODUCT_ALREADY_EXISTS
  | typeof FIND_ONE_VOUCHER_PRODUCT_FAILED;

export type TVoucherProductErrorCode = Record<
  TVoucherProductErrorCodeKey,
  TErrorCodeValue
>;

// 157501 - 158000
export const VoucherProductValidation: TVoucherProductErrorCode = {
  VOUCHER_PRODUCT_NOT_FOUND: createErrorCode(
    157501,
    'Voucher product not found',
  ),
  VOUCHER_PRODUCT_ALREADY_EXISTS: createErrorCode(
    157502,
    'Voucher product already exists',
  ),
  FIND_ONE_VOUCHER_PRODUCT_FAILED: createErrorCode(
    157503,
    'Find one voucher product failed',
  ),
};
