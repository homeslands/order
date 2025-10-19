import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';
import { CoinPolicyConstanst } from './coin-policy.constants';
import { CurrencyUtil } from 'src/shared/utils/currency.util';

export const COIN_POLICY_NOT_FOUND = 'COIN_POLICY_NOT_FOUND';
export const ERROR_WHEN_UPDATE_COIN_POLICY = 'ERROR_WHEN_UPDATE_COIN_POLICY';
export const COIN_POLICY_IS_NOT_ACTIVE = 'COIN_POLICY_IS_NOT_ACTIVE';
export const COIN_POLICY_VALUE_TYPE_MUST_BE_INTEGER = 'COIN_POLICY_VALUE_TYPE_MUST_BE_INTEGER';
export const COIN_POLICY_VALUE_TYPE_IS_NOT_VALID = 'COIN_POLICY_VALUE_TYPE_IS_NOT_VALID';
export const VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_DEFAULT_VALUE = 'VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_DEFAULT_VALUE';
export const EXCEED_MAXIMUM_BALANCE = 'EXCEED_MAXIMUM_BALANCE';

export type TCoinPolicyErrorCodeKey =
  | typeof COIN_POLICY_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_COIN_POLICY
  | typeof COIN_POLICY_IS_NOT_ACTIVE
  | typeof COIN_POLICY_VALUE_TYPE_MUST_BE_INTEGER
  | typeof COIN_POLICY_VALUE_TYPE_IS_NOT_VALID
  | typeof VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_DEFAULT_VALUE
  | typeof EXCEED_MAXIMUM_BALANCE;

// 159701 - 159800
export type TCoinPolicyErrorCode = Record<TCoinPolicyErrorCodeKey, TErrorCodeValue>;

export const CoinPolicyValidation: TCoinPolicyErrorCode = {
  COIN_POLICY_NOT_FOUND: createErrorCode(159701, 'Card not found'),
  ERROR_WHEN_UPDATE_COIN_POLICY: createErrorCode(159702, 'Error when update card'),
  COIN_POLICY_IS_NOT_ACTIVE: createErrorCode(159703, 'Card is not active'),
  COIN_POLICY_VALUE_TYPE_MUST_BE_INTEGER: createErrorCode(159704, 'Coin policy value type must be integer'),
  COIN_POLICY_VALUE_TYPE_IS_NOT_VALID: createErrorCode(159705, 'Coin policy value is not valid'),
  VALUE_MUST_BE_GREATER_THAN_OR_EQUAL_TO_DEFAULT_VALUE: createErrorCode(159706, `Coin policy value must be greater than or equal to ${CurrencyUtil.formatCurrency(CoinPolicyConstanst.DEFAULT_MAX_BALANCE_VALUE)}`),
  EXCEED_MAXIMUM_BALANCE: createErrorCode(159707, `User balance cannot exceed the maximum allowed limit of ${CurrencyUtil.formatCurrency(CoinPolicyConstanst.DEFAULT_MAX_BALANCE_VALUE)} coins.`)
};
