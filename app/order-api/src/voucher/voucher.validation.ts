import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const VOUCHER_NOT_FOUND = 'VOUCHER_NOT_FOUND';
export const CREATE_VOUCHER_FAILED = 'CREATE_VOUCHER_FAILED';
export const FIND_ALL_VOUCHER_FAILED = 'FIND_ALL_VOUCHER_FAILED';
export const FIND_ONE_VOUCHER_FAILED = 'FIND_ONE_VOUCHER_FAILED';
export const UPDATE_VOUCHER_FAILED = 'UPDATE_VOUCHER_FAILED';
export const DELETE_VOUCHER_FAILED = 'DELETE_VOUCHER_FAILED';

export type TVoucherErrorCodeKey =
  | typeof VOUCHER_NOT_FOUND
  | typeof FIND_ALL_VOUCHER_FAILED
  | typeof FIND_ONE_VOUCHER_FAILED
  | typeof UPDATE_VOUCHER_FAILED
  | typeof DELETE_VOUCHER_FAILED
  | typeof CREATE_VOUCHER_FAILED;
export type TVoucherErrorCode = Record<TVoucherErrorCodeKey, TErrorCodeValue>;

// 143401 – 144000
export const VoucherValidation: TVoucherErrorCode = {
  VOUCHER_NOT_FOUND: createErrorCode(143401, 'Voucher not found'),
  CREATE_VOUCHER_FAILED: createErrorCode(143402, 'Failed to create voucher'),
  FIND_ALL_VOUCHER_FAILED: createErrorCode(
    143403,
    'Failed to find all vouchers',
  ),
  FIND_ONE_VOUCHER_FAILED: createErrorCode(
    143404,
    'Failed to find one voucher',
  ),
  UPDATE_VOUCHER_FAILED: createErrorCode(143405, 'Failed to update voucher'),
  DELETE_VOUCHER_FAILED: createErrorCode(143406, 'Failed to delete voucher'),
};
