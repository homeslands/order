import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ACCUMULATED_POINT_NOT_FOUND = 'ACCUMULATED_POINT_NOT_FOUND';
export const INSUFFICIENT_POINTS = 'INSUFFICIENT_POINTS';
export const INVALID_POINTS_AMOUNT = 'INVALID_POINTS_AMOUNT';
export const POINTS_EXCEED_ORDER_TOTAL = 'POINTS_EXCEED_ORDER_TOTAL';
export const ERROR_CREATING_ACCUMULATED_POINT =
  'ERROR_CREATING_ACCUMULATED_POINT';
export const ERROR_UPDATING_POINTS = 'ERROR_UPDATING_POINTS';
export const ERROR_CREATING_TRANSACTION_HISTORY =
  'ERROR_CREATING_TRANSACTION_HISTORY';
export const CUSTOMER_ONLY_FEATURE = 'CUSTOMER_ONLY_FEATURE';
export const DEFAULT_CUSTOMER_NOT_ELIGIBLE = 'DEFAULT_CUSTOMER_NOT_ELIGIBLE';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const ORDER_NOT_FOUND = 'ORDER_NOT_FOUND';
export const ORDER_OWNER_NOT_FOUND = 'ORDER_OWNER_NOT_FOUND';
export const POINTS_ALREADY_RESERVED = 'POINTS_ALREADY_RESERVED';
export const NO_RESERVED_POINTS_FOUND = 'NO_RESERVED_POINTS_FOUND';
export const ORDER_STATUS_INVALID = 'ORDER_STATUS_INVALID';
export const POINTS_ALREADY_RESERVED_FOR_OTHER_ORDER =
  'POINTS_ALREADY_RESERVED_FOR_OTHER_ORDER';

export type TAccumulatedPointErrorCodeKey =
  | typeof ACCUMULATED_POINT_NOT_FOUND
  | typeof INSUFFICIENT_POINTS
  | typeof INVALID_POINTS_AMOUNT
  | typeof POINTS_EXCEED_ORDER_TOTAL
  | typeof ERROR_CREATING_ACCUMULATED_POINT
  | typeof ERROR_UPDATING_POINTS
  | typeof ERROR_CREATING_TRANSACTION_HISTORY
  | typeof CUSTOMER_ONLY_FEATURE
  | typeof DEFAULT_CUSTOMER_NOT_ELIGIBLE
  | typeof USER_NOT_FOUND
  | typeof ORDER_NOT_FOUND
  | typeof ORDER_OWNER_NOT_FOUND
  | typeof POINTS_ALREADY_RESERVED
  | typeof NO_RESERVED_POINTS_FOUND
  | typeof ORDER_STATUS_INVALID
  | typeof POINTS_ALREADY_RESERVED_FOR_OTHER_ORDER;

// 159001 – 159100
export type TAccumulatedPointErrorCode = Record<
  TAccumulatedPointErrorCodeKey,
  TErrorCodeValue
>;

// 159001 – 159100
export const AccumulatedPointValidation: TAccumulatedPointErrorCode = {
  ACCUMULATED_POINT_NOT_FOUND: createErrorCode(
    159001,
    'Accumulated point account not found',
  ),
  INSUFFICIENT_POINTS: createErrorCode(
    159002,
    'Insufficient points for this transaction',
  ),
  INVALID_POINTS_AMOUNT: createErrorCode(159003, 'Invalid points amount'),
  POINTS_EXCEED_ORDER_TOTAL: createErrorCode(
    159004,
    'Points exceed order total amount',
  ),
  ERROR_CREATING_ACCUMULATED_POINT: createErrorCode(
    159005,
    'Error when creating accumulated point account',
  ),
  ERROR_UPDATING_POINTS: createErrorCode(159006, 'Error when updating points'),
  ERROR_CREATING_TRANSACTION_HISTORY: createErrorCode(
    159007,
    'Error when creating transaction history',
  ),
  CUSTOMER_ONLY_FEATURE: createErrorCode(
    159008,
    'This feature is only available for registered customers',
  ),
  DEFAULT_CUSTOMER_NOT_ELIGIBLE: createErrorCode(
    159009,
    'Default customers are not eligible for points accumulation',
  ),
  USER_NOT_FOUND: createErrorCode(159010, 'User not found'),
  ORDER_NOT_FOUND: createErrorCode(159011, 'Order not found'),
  ORDER_OWNER_NOT_FOUND: createErrorCode(159012, 'Order owner not found'),
  POINTS_ALREADY_RESERVED: createErrorCode(
    159013,
    'Points already reserved for this order',
  ),
  NO_RESERVED_POINTS_FOUND: createErrorCode(
    159014,
    'No reserved points found for this order',
  ),
  ORDER_STATUS_INVALID: createErrorCode(
    159015,
    'Order status is not valid for this operation',
  ),
  POINTS_ALREADY_RESERVED_FOR_OTHER_ORDER: createErrorCode(
    159016,
    'Points already reserved for other order',
  ),
};
