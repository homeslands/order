import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_BALANCE = 'ERROR_WHEN_CREATE_BALANCE';
export const BALANCE_NOT_FOUND = 'BALANCE_NOT_FOUND';
export const ERROR_WHEN_UPDATE_BALANCE = 'ERROR_WHEN_UPDATE_BALANCE';
export const ERROR_WHEN_REMOVE_BALANCE = 'ERROR_WHEN_REMOVE_BALANCE';

export type TBalanceErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_BALANCE
  | typeof BALANCE_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_BALANCE
  | typeof ERROR_WHEN_REMOVE_BALANCE;

// 158201- 158300
export type TBalanceErrorCode = Record<TBalanceErrorCodeKey, TErrorCodeValue>;

export const BalanceValidation: TBalanceErrorCode = {
  ERROR_WHEN_CREATE_BALANCE: createErrorCode(
    158201,
    'Error when create balance',
  ),
  BALANCE_NOT_FOUND: createErrorCode(158202, 'Balance not found'),
  ERROR_WHEN_UPDATE_BALANCE: createErrorCode(
    158203,
    'Error when update balance',
  ),
  ERROR_WHEN_REMOVE_BALANCE: createErrorCode(
    158204,
    'Error when remove balance',
  ),
};
