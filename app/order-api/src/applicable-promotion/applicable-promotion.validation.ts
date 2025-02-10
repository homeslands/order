import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const APPLICABLE_PROMOTION_NOT_FOUND = 'APPLICABLE_PROMOTION_NOT_FOUND';
export const APPLICABLE_PROMOTION_ALREADY_EXISTED = 'APPLICABLE_PROMOTION_ALREADY_EXISTED';
export const ERROR_WHEN_CREATE_APPLICABLE_PROMOTION = 'ERROR_WHEN_CREATE_APPLICABLE_PROMOTION';
export const ERROR_WHEN_DELETE_APPLICABLE_PROMOTION = 'ERROR_WHEN_DELETE_APPLICABLE_PROMOTION';

export type TApplicablePromotionErrorCodeKey = 
typeof ERROR_WHEN_DELETE_APPLICABLE_PROMOTION |
typeof ERROR_WHEN_CREATE_APPLICABLE_PROMOTION |
typeof APPLICABLE_PROMOTION_ALREADY_EXISTED |
typeof APPLICABLE_PROMOTION_NOT_FOUND;

export type TApplicablePromotionErrorCode = Record<
  TApplicablePromotionErrorCodeKey,
  TErrorCodeValue
>;

// 151000 - 151000
export const ApplicablePromotionValidation: TApplicablePromotionErrorCode = {
  APPLICABLE_PROMOTION_NOT_FOUND: createErrorCode(
    151000,
    'Applicable promotion not found',
  ),
  ERROR_WHEN_DELETE_APPLICABLE_PROMOTION: createErrorCode(
    151001,
    'Error when delete applicable promotion',
  ),
  ERROR_WHEN_CREATE_APPLICABLE_PROMOTION: createErrorCode(
    151002,
    'Error when create applicable promotion',
  ),
  APPLICABLE_PROMOTION_ALREADY_EXISTED: createErrorCode(
    151003,
    'Applicable promotion already existed',
  ),
};
