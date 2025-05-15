import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PRODUCT_ANALYSIS_NOT_FOUND = 'PRODUCT_ANALYSIS_NOT_FOUND';
export const CAN_NOT_REFRESH_PRODUCT_ANALYSIS_MANUALLY_FROM_0H_TO_2H =
  'CAN_NOT_REFRESH_PRODUCT_ANALYSIS_MANUALLY_FROM_0H_TO_2H';
export const START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE =
  'START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE';

export type TProductAnalysisErrorCodeKey =
  | typeof CAN_NOT_REFRESH_PRODUCT_ANALYSIS_MANUALLY_FROM_0H_TO_2H
  | typeof START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE
  | typeof PRODUCT_ANALYSIS_NOT_FOUND;

export type TProductAnalysisErrorCode = Record<
  TProductAnalysisErrorCodeKey,
  TErrorCodeValue
>;

// 139501 - 139999
export const ProductAnalysisValidation: TProductAnalysisErrorCode = {
  PRODUCT_ANALYSIS_NOT_FOUND: createErrorCode(
    139501,
    'Product analysis not found',
  ),
  CAN_NOT_REFRESH_PRODUCT_ANALYSIS_MANUALLY_FROM_0H_TO_2H: createErrorCode(
    139502,
    'Can not refresh product analysis manually from 0h to 2h',
  ),
  START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE: createErrorCode(
    139503,
    'Start date only smaller or equal end date',
  ),
};
