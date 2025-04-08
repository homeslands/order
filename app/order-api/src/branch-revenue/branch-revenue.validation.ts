import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CREATE_BRANCH_REVENUE_ERROR = 'CREATE_BRANCH_REVENUE_ERROR';
export const REFRESH_BRANCH_REVENUE_ERROR = 'REFRESH_BRANCH_REVENUE_ERROR';
export const MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE =
  'MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE';
export const CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H =
  'CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H';
export const START_DATE_IS_NOT_EMPTY = 'START_DATE_IS_NOT_EMPTY';
export const END_DATE_IS_NOT_EMPTY = 'END_DATE_IS_NOT_EMPTY';
export const START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE =
  'START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE';
export const BRANCH_SLUG_IS_NOT_EMPTY = 'BRANCH_SLUG_IS_NOT_EMPTY';
export const START_DATE_AND_END_DATE_MUST_BE_PROVIDED =
  'START_DATE_AND_END_DATE_MUST_BE_PROVIDED';
export type TBranchRevenueErrorCodeKey =
  | typeof REFRESH_BRANCH_REVENUE_ERROR
  | typeof MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE
  | typeof CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H
  | typeof START_DATE_IS_NOT_EMPTY
  | typeof END_DATE_IS_NOT_EMPTY
  | typeof START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE
  | typeof CREATE_BRANCH_REVENUE_ERROR
  | typeof BRANCH_SLUG_IS_NOT_EMPTY
  | typeof START_DATE_AND_END_DATE_MUST_BE_PROVIDED;

// 143001 – 143200
export type TBranchRevenueErrorCode = {
  CREATE_BRANCH_REVENUE_ERROR: TErrorCodeValue;
  REFRESH_BRANCH_REVENUE_ERROR: TErrorCodeValue;
  MAY_BE_DUPLICATE_RECORD_BRANCH_REVENUE_ONE_DAY_IN_DATABASE: TErrorCodeValue;
  CAN_NOT_REFRESH_BRANCH_REVENUE_MANUALLY_FROM_0H_TO_2H: TErrorCodeValue;
  START_DATE_IS_NOT_EMPTY: TErrorCodeValue;
  END_DATE_IS_NOT_EMPTY: TErrorCodeValue;
  START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE: TErrorCodeValue;
  BRANCH_SLUG_IS_NOT_EMPTY: TErrorCodeValue;
  EXPORT_BRANCH_REVENUE_ERROR: TErrorCodeValue;
  START_DATE_AND_END_DATE_MUST_BE_PROVIDED: TErrorCodeValue;
};

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
  START_DATE_IS_NOT_EMPTY: createErrorCode(143005, 'Start date is not empty'),
  END_DATE_IS_NOT_EMPTY: createErrorCode(143006, 'End date is not empty'),
  START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE: createErrorCode(
    143007,
    'Start date only smaller or equal end date',
  ),
  BRANCH_SLUG_IS_NOT_EMPTY: createErrorCode(143008, 'Branch slug is not empty'),
  EXPORT_BRANCH_REVENUE_ERROR: createErrorCode(
    143209,
    'Error when exporting branch revenue to Excel',
  ),
  START_DATE_AND_END_DATE_MUST_BE_PROVIDED: createErrorCode(
    143210,
    'Start date and end date must be provided',
  ),
};
