import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const VOUCHER_NOT_FOUND = 'VOUCHER_NOT_FOUND';
export const CREATE_VOUCHER_FAILED = 'CREATE_VOUCHER_FAILED';
export const FIND_ALL_VOUCHER_FAILED = 'FIND_ALL_VOUCHER_FAILED';
export const FIND_ONE_VOUCHER_FAILED = 'FIND_ONE_VOUCHER_FAILED';
export const UPDATE_VOUCHER_FAILED = 'UPDATE_VOUCHER_FAILED';
export const DELETE_VOUCHER_FAILED = 'DELETE_VOUCHER_FAILED';
export const VOUCHER_ALREADY_USED = 'VOUCHER_ALREADY_USED';
export const VOUCHER_IS_NOT_ACTIVE = 'VOUCHER_IS_NOT_ACTIVE';
export const VOUCHER_HAS_NO_REMAINING_USAGE = 'VOUCHER_HAS_NO_REMAINING_USAGE';
export const ORDER_VALUE_LESS_THAN_MIN_ORDER_VALUE =
  'ORDER_VALUE_LESS_THAN_MIN_ORDER_VALUE';
export const USER_MUST_BE_CUSTOMER = 'USER_MUST_BE_CUSTOMER';
export const VALIDATE_VOUCHER_USAGE_FAILED = 'VALIDATE_VOUCHER_USAGE_FAILED';
export const INVALID_VOUCHER_TYPE = 'INVALID_VOUCHER_TYPE';
export const INVALID_NUMBER_OF_USAGE_PER_USER =
  'INVALID_NUMBER_OF_USAGE_PER_USER';
export const DUPLICATE_VOUCHER_TITLE = 'DUPLICATE_VOUCHER_TITLE';
export const MUST_VERIFY_IDENTITY_TO_USE_VOUCHER =
  'MUST_VERIFY_IDENTITY_TO_USE_VOUCHER';
export const VOUCHER_HAS_ORDERS = 'VOUCHER_HAS_ORDERS';
export const VOUCHER_HAS_USED_CAN_NOT_UPDATE_MAX_USAGE =
  'VOUCHER_HAS_USED_CAN_NOT_UPDATE_MAX_USAGE';
export const INVALID_VOUCHER_SLUGS = 'INVALID_VOUCHER_SLUGS';
export type TVoucherErrorCodeKey =
  | typeof VOUCHER_NOT_FOUND
  | typeof FIND_ALL_VOUCHER_FAILED
  | typeof FIND_ONE_VOUCHER_FAILED
  | typeof UPDATE_VOUCHER_FAILED
  | typeof DELETE_VOUCHER_FAILED
  | typeof VOUCHER_ALREADY_USED
  | typeof VOUCHER_IS_NOT_ACTIVE
  | typeof ORDER_VALUE_LESS_THAN_MIN_ORDER_VALUE
  | typeof VOUCHER_HAS_NO_REMAINING_USAGE
  | typeof CREATE_VOUCHER_FAILED
  | typeof USER_MUST_BE_CUSTOMER
  | typeof VALIDATE_VOUCHER_USAGE_FAILED
  | typeof INVALID_VOUCHER_TYPE
  | typeof INVALID_NUMBER_OF_USAGE_PER_USER
  | typeof DUPLICATE_VOUCHER_TITLE
  | typeof MUST_VERIFY_IDENTITY_TO_USE_VOUCHER
  | typeof VOUCHER_HAS_ORDERS
  | typeof VOUCHER_HAS_USED_CAN_NOT_UPDATE_MAX_USAGE
  | typeof INVALID_VOUCHER_SLUGS;

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
  VOUCHER_ALREADY_USED: createErrorCode(143407, 'Voucher already used'),
  VOUCHER_IS_NOT_ACTIVE: createErrorCode(143408, 'Voucher is not active'),
  ORDER_VALUE_LESS_THAN_MIN_ORDER_VALUE: createErrorCode(
    143409,
    'Order value is less than min order value',
  ),
  VOUCHER_HAS_NO_REMAINING_USAGE: createErrorCode(
    143410,
    'Voucher has no remaining usage',
  ),
  USER_MUST_BE_CUSTOMER: createErrorCode(143411, 'User must be customer'),
  VALIDATE_VOUCHER_USAGE_FAILED: createErrorCode(
    143412,
    'Validate voucher usage failed',
  ),
  INVALID_VOUCHER_TYPE: createErrorCode(143413, 'Invalid voucher type'),
  INVALID_NUMBER_OF_USAGE_PER_USER: createErrorCode(
    143414,
    'Invalid number of usage per user',
  ),
  DUPLICATE_VOUCHER_TITLE: createErrorCode(143415, 'Duplicate voucher title'),
  MUST_VERIFY_IDENTITY_TO_USE_VOUCHER: createErrorCode(
    143416,
    'Must verify identity to use voucher',
  ),
  VOUCHER_HAS_ORDERS: createErrorCode(143417, 'Voucher has orders'),
  VOUCHER_HAS_USED_CAN_NOT_UPDATE_MAX_USAGE: createErrorCode(
    143418,
    'Voucher has used can not update max usage',
  ),
  INVALID_VOUCHER_SLUGS: createErrorCode(143419, 'Invalid voucher slugs'),
};
