import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const INVALID_BRANCH_NAME = 'INVALID_BRANCH_NAME';
export const INVALID_BRANCH_SLUG = 'INVALID_BRANCH_SLUG';
export const BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND';
export const INVALID_BRANCH_ADDRESS = 'INVALID_BRANCH_ADDRESS';
export const ERROR_WHEN_DELETE_BRANCH = 'ERROR_WHEN_DELETE_BRANCH';
export const ERROR_WHEN_UPDATE_BRANCH = 'ERROR_WHEN_UPDATE_BRANCH';
export const ERROR_WHEN_CREATE_BRANCH = 'ERROR_WHEN_CREATE_BRANCH';
export const INVALID_BRANCH_PLACE_ID = 'INVALID_BRANCH_PLACE_ID';
export const BRANCH_ADDRESS_DETAIL_NOT_FOUND =
  'BRANCH_ADDRESS_DETAIL_NOT_FOUND';

export type TBranchErrorCodeKey =
  | typeof INVALID_BRANCH_ADDRESS
  | typeof BRANCH_NOT_FOUND
  | typeof INVALID_BRANCH_SLUG
  | typeof ERROR_WHEN_DELETE_BRANCH
  | typeof ERROR_WHEN_UPDATE_BRANCH
  | typeof ERROR_WHEN_CREATE_BRANCH
  | typeof INVALID_BRANCH_NAME
  | typeof INVALID_BRANCH_PLACE_ID
  | typeof BRANCH_ADDRESS_DETAIL_NOT_FOUND;

// 105000 - 106000
export type TBranchErrorCode = Record<TBranchErrorCodeKey, TErrorCodeValue>;

export const BranchValidation: TBranchErrorCode = {
  INVALID_BRANCH_ADDRESS: createErrorCode(105000, 'Invalid branch address'),
  INVALID_BRANCH_NAME: createErrorCode(105001, 'Invalid branch name'),
  BRANCH_NOT_FOUND: createErrorCode(105002, 'Branch not found'),
  INVALID_BRANCH_SLUG: createErrorCode(105003, 'Branch slug invalid'),
  ERROR_WHEN_DELETE_BRANCH: createErrorCode(105004, 'Error when delete branch'),
  ERROR_WHEN_UPDATE_BRANCH: createErrorCode(105005, 'Error when update branch'),
  ERROR_WHEN_CREATE_BRANCH: createErrorCode(105006, 'Error when create branch'),
  INVALID_BRANCH_PLACE_ID: createErrorCode(105007, 'Invalid branch place id'),
  BRANCH_ADDRESS_DETAIL_NOT_FOUND: createErrorCode(
    105008,
    'Branch address detail not found',
  ),
};
