import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CREATE_REVENUE_ERROR = 'CREATE_REVENUE_ERROR';
export const HAVE_NOT_NEW_REVENUE_IN_CURRENT_DATE =
  'HAVE_NOT_NEW_REVENUE_IN_CURRENT_DATE';
export const DUPLICATE_RECORD_REVENUE_ONE_DAY_IN_DATABASE =
  'DUPLICATE_RECORD_REVENUE_ONE_DAY_IN_DATABASE';
export const CAN_NOT_REFRESH_REVENUE_MANUALLY_FROM_0H_TO_2H =
  'CAN_NOT_REFRESH_REVENUE_MANUALLY_FROM_0H_TO_2H';
export const START_DATE_IS_NOT_EMPTY = 'START_DATE_IS_NOT_EMPTY';
export const END_DATE_IS_NOT_EMPTY = 'END_DATE_IS_NOT_EMPTY';
export const START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE =
  'START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE';
export const UPDATE_REVENUE_ERROR = 'UPDATE_REVENUE_ERROR';

export type TRevenueErrorCodeKey =
  | typeof HAVE_NOT_NEW_REVENUE_IN_CURRENT_DATE
  | typeof DUPLICATE_RECORD_REVENUE_ONE_DAY_IN_DATABASE
  | typeof CAN_NOT_REFRESH_REVENUE_MANUALLY_FROM_0H_TO_2H
  | typeof START_DATE_IS_NOT_EMPTY
  | typeof END_DATE_IS_NOT_EMPTY
  | typeof START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE
  | typeof UPDATE_REVENUE_ERROR
  | typeof CREATE_REVENUE_ERROR;

// 143201 – 143400
export type TRevenueErrorCode = Record<TRevenueErrorCodeKey, TErrorCodeValue>;

export const RevenueValidation: TRevenueErrorCode = {
  CREATE_REVENUE_ERROR: createErrorCode(143201, 'Error when creating revenues'),
  HAVE_NOT_NEW_REVENUE_IN_CURRENT_DATE: createErrorCode(
    143202,
    'Have not new revenue in current date',
  ),
  DUPLICATE_RECORD_REVENUE_ONE_DAY_IN_DATABASE: createErrorCode(
    143203,
    'Duplicate record revenue one day in database',
  ),
  CAN_NOT_REFRESH_REVENUE_MANUALLY_FROM_0H_TO_2H: createErrorCode(
    143204,
    'Can not refresh revenue manually from 0h to 2h',
  ),
  START_DATE_IS_NOT_EMPTY: createErrorCode(143205, 'Start date is not empty'),
  END_DATE_IS_NOT_EMPTY: createErrorCode(143206, 'End date is not empty'),
  START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE: createErrorCode(
    143207,
    'Start date only smaller or equal end date',
  ),
  UPDATE_REVENUE_ERROR: createErrorCode(143208, 'Update revenue error'),
};
