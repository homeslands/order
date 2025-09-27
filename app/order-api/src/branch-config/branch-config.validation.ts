import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const BRANCH_CONFIG_KEY_INVALID = 'BRANCH_CONFIG_KEY_INVALID';
export const BRANCH_CONFIG_VALUE_INVALID = 'BRANCH_CONFIG_VALUE_INVALID';
export const CREATE_BRANCH_CONFIG_ERROR = 'CREATE_BRANCH_CONFIG_ERROR';
export const BRANCH_CONFIG_QUERY_INVALID = 'BRANCH_CONFIG_QUERY_INVALID';
export const BRANCH_CONFIG_NOT_FOUND = 'BRANCH_CONFIG_NOT_FOUND';
export const BRANCH_SLUG_INVALID = 'BRANCH_SLUG_INVALID';
export const BRANCH_CONFIG_ALREADY_EXISTS = 'BRANCH_CONFIG_ALREADY_EXISTS';

export type TBranchConfigErrorCodeKey =
  | typeof BRANCH_CONFIG_KEY_INVALID
  | typeof BRANCH_CONFIG_VALUE_INVALID
  | typeof CREATE_BRANCH_CONFIG_ERROR
  | typeof BRANCH_CONFIG_QUERY_INVALID
  | typeof BRANCH_CONFIG_NOT_FOUND
  | typeof BRANCH_SLUG_INVALID
  | typeof BRANCH_CONFIG_ALREADY_EXISTS;

// 159301  - 159400
export type TBranchConfigErrorCode = Record<
  TBranchConfigErrorCodeKey,
  TErrorCodeValue
>;

export const BranchConfigValidation: TBranchConfigErrorCode = {
  BRANCH_CONFIG_KEY_INVALID: createErrorCode(
    159301,
    'Branch config key invalid',
  ),
  BRANCH_CONFIG_VALUE_INVALID: createErrorCode(
    159302,
    'Branch config value invalid',
  ),
  CREATE_BRANCH_CONFIG_ERROR: createErrorCode(
    159303,
    'Error when create branch config',
  ),
  BRANCH_CONFIG_QUERY_INVALID: createErrorCode(
    159304,
    'Branch config query invalid',
  ),
  BRANCH_CONFIG_NOT_FOUND: createErrorCode(159305, 'Branch config not found'),
  BRANCH_SLUG_INVALID: createErrorCode(159306, 'Branch slug invalid'),
  BRANCH_CONFIG_ALREADY_EXISTS: createErrorCode(
    159307,
    'Branch config already exists',
  ),
};
