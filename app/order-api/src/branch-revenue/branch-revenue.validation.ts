import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CREATE_BRANCH_REVENUE_ERROR = 'CREATE_BRANCH_REVENUE_ERROR';
export const REFRESH_BRANCH_REVENUE_ERROR = 'REFRESH_BRANCH_REVENUE_ERROR';
export const MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE = 
  'MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE';
export const CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H = 
  'CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H';

export type TBranchRevenueErrorCodeKey = 
  typeof REFRESH_BRANCH_REVENUE_ERROR |
  typeof MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE |
  typeof CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H |
  typeof CREATE_BRANCH_REVENUE_ERROR;

// 143001 – 143200
export type TBranchRevenueErrorCode = Record<
  TBranchRevenueErrorCodeKey,
  TErrorCodeValue
>;

export const BranchRevenueValidation: TBranchRevenueErrorCode = {
  CREATE_BRANCH_REVENUE_ERROR: createErrorCode(
    143001,
    'Error when creating branch revenues',
  ),
  REFRESH_BRANCH_REVENUE_ERROR: createErrorCode(
    143002,
    'Error when refresh branch revenues',
  ),
  MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE: createErrorCode(
    143003,
    'May be duplicate record branch revenue one day in database',
  ),
  CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H: createErrorCode(
    143004,
    'Can not fresh branch revenue manually from 0h to 2h',
  ),
};
