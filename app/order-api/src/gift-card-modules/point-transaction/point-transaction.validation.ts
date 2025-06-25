import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_POINT_TRANSACTION =
  'ERROR_WHEN_CREATE_POINT_TRANSACTION';
export const POINT_TRANSACTION_NOT_FOUND = 'POINT_TRANSACTION_NOT_FOUND';
export const ERROR_WHEN_UPDATE_POINT_TRANSACTION =
  'ERROR_WHEN_UPDATE_POINT_TRANSACTION';
export const ERROR_WHEN_REMOVE_POINT_TRANSACTION =
  'ERROR_WHEN_REMOVE_POINT_TRANSACTION';
export const INVALID_POINT_TRANSACTION_TYPE = 'INVALID_POINT_TRANSACTION_TYPE';
export const INVALID_POINT_TRANSACTION_OBJECT_TYPE =
  'INVALID_POINT_TRANSACTION_OBJECT_TYPE';
export const OBJECT_TYPE_NOT_FOUND = 'OBJECT_TYPE_NOT_FOUND';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const INVALID_POINT_TRANSACTION_MIN_VALUE =
  'INVALID_POINT_TRANSACTION_MIN_VALUE';
export const INVALID_IN_ORDER_TRANSACTION = 'INVALID_IN_ORDER_TRANSACTION';
export const INVALID_OUT_ORDER_TRANSACTION = 'INVALID_OUT_ORDER_TRANSACTION';

export type TPointTransactionErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_POINT_TRANSACTION
  | typeof POINT_TRANSACTION_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_POINT_TRANSACTION
  | typeof ERROR_WHEN_REMOVE_POINT_TRANSACTION
  | typeof INVALID_POINT_TRANSACTION_TYPE
  | typeof INVALID_POINT_TRANSACTION_OBJECT_TYPE
  | typeof OBJECT_TYPE_NOT_FOUND
  | typeof USER_NOT_FOUND
  | typeof INVALID_POINT_TRANSACTION_MIN_VALUE
  | typeof INVALID_IN_ORDER_TRANSACTION
  | typeof INVALID_OUT_ORDER_TRANSACTION;

// 158501 - 158600
export type TPointTransactionErrorCode = Record<
  TPointTransactionErrorCodeKey,
  TErrorCodeValue
>;

export const PointTransactionValidation: TPointTransactionErrorCode = {
  ERROR_WHEN_CREATE_POINT_TRANSACTION: createErrorCode(
    158501,
    'Error when create point transaction',
  ),
  POINT_TRANSACTION_NOT_FOUND: createErrorCode(
    158502,
    'point transaction not found',
  ),
  ERROR_WHEN_UPDATE_POINT_TRANSACTION: createErrorCode(
    158503,
    'Error when update point transaction',
  ),
  ERROR_WHEN_REMOVE_POINT_TRANSACTION: createErrorCode(
    158504,
    'Error when remove point transaction',
  ),
  INVALID_POINT_TRANSACTION_TYPE: createErrorCode(
    158505,
    'Invalid point transaction type. Type must be either in or out',
  ),
  INVALID_POINT_TRANSACTION_OBJECT_TYPE: createErrorCode(
    158506,
    'Invalid point transaction object type. Must be either order or gift-card',
  ),
  OBJECT_TYPE_NOT_FOUND: createErrorCode(158507, 'Object type not found'),
  USER_NOT_FOUND: createErrorCode(158508, 'User not found'),
  INVALID_POINT_TRANSACTION_MIN_VALUE: createErrorCode(
    158509,
    'Points must be greater than or equal to 0.',
  ),
  INVALID_IN_ORDER_TRANSACTION: createErrorCode(
    158510,
    'Point type in is not valid when the object type is order.',
  ),
  INVALID_OUT_ORDER_TRANSACTION: createErrorCode(
    158511,
    'Point type out is not valid when the object type is gift-card.',
  ),
};
