import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_POINT_TRANSACTION =
  'ERROR_WHEN_CREATE_POINT_TRANSACTION';
export const POINT_TRANSACTION_NOT_FOUND = 'POINT_TRANSACTION_NOT_FOUND';
export const ERROR_WHEN_UPDATE_POINT_TRANSACTION =
  'ERROR_WHEN_UPDATE_POINT_TRANSACTION';
export const ERROR_WHEN_REMOVE_POINT_TRANSACTION =
  'ERROR_WHEN_REMOVE_POINT_TRANSACTION';
export const INVALID_POINT_TRANSACTION_TYPE = 'INVALID_POINT_TRANSACTION_TYPE';

export type TPointTransactionErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_POINT_TRANSACTION
  | typeof POINT_TRANSACTION_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_POINT_TRANSACTION
  | typeof ERROR_WHEN_REMOVE_POINT_TRANSACTION
  | typeof INVALID_POINT_TRANSACTION_TYPE;

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
    'Invalid point transaction type',
  ),
};
