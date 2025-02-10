import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PROMOTION_NOT_FOUND = 'PROMOTION_NOT_FOUND';
export const DENY_DELETE_PROMOTION = 'DENY_DELETE_PROMOTION';

export type TPromotionErrorCodeKey = 
typeof DENY_DELETE_PROMOTION |
typeof PROMOTION_NOT_FOUND;

export type TPromotionErrorCode = Record<
  TPromotionErrorCodeKey,
  TErrorCodeValue
>;

// 150500 - 150999
export const PromotionValidation: TPromotionErrorCode = {
  PROMOTION_NOT_FOUND: createErrorCode(
    150500,
    'Promotion not found',
  ),
  DENY_DELETE_PROMOTION: createErrorCode(
    150501,
    'Deny delete promotion',
  ),
};
