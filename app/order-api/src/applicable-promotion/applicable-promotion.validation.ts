import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const APPLICABLE_PROMOTION_NOT_FOUND = 'APPLICABLE_PROMOTION_NOT_FOUND';
export const APPLICABLE_PROMOTION_ALREADY_EXISTED =
  'APPLICABLE_PROMOTION_ALREADY_EXISTED';
export const ERROR_WHEN_CREATE_APPLICABLE_PROMOTION =
  'ERROR_WHEN_CREATE_APPLICABLE_PROMOTION';
export const ERROR_WHEN_DELETE_APPLICABLE_PROMOTION =
  'ERROR_WHEN_DELETE_APPLICABLE_PROMOTION';
export const ERROR_WHEN_GET_MENU_ITEM_BY_APPLICABLE_PROMOTION =
  'ERROR_WHEN_GET_MENU_ITEM_BY_APPLICABLE_PROMOTION';
export const MUST_HAVE_BOTH_PROMOTION_SLUG_AND_APPLICABLE_SLUG =
  'MUST_HAVE_BOTH_PROMOTION_SLUG_AND_APPLICABLE_SLUG';
export const ERROR_WHEN_HANDLE_DATA_TO_DELETE_APPLICABLE_PROMOTION =
  'ERROR_WHEN_HANDLE_DATA_TO_DELETE_APPLICABLE_PROMOTION';

export type TApplicablePromotionErrorCodeKey =
  | typeof ERROR_WHEN_DELETE_APPLICABLE_PROMOTION
  | typeof ERROR_WHEN_CREATE_APPLICABLE_PROMOTION
  | typeof APPLICABLE_PROMOTION_ALREADY_EXISTED
  | typeof ERROR_WHEN_GET_MENU_ITEM_BY_APPLICABLE_PROMOTION
  | typeof MUST_HAVE_BOTH_PROMOTION_SLUG_AND_APPLICABLE_SLUG
  | typeof ERROR_WHEN_HANDLE_DATA_TO_DELETE_APPLICABLE_PROMOTION
  | typeof APPLICABLE_PROMOTION_NOT_FOUND;

export type TApplicablePromotionErrorCode = Record<
  TApplicablePromotionErrorCodeKey,
  TErrorCodeValue
>;

// 151001 - 151500
export const ApplicablePromotionValidation: TApplicablePromotionErrorCode = {
  APPLICABLE_PROMOTION_NOT_FOUND: createErrorCode(
    151001,
    'Applicable promotion not found',
  ),
  ERROR_WHEN_DELETE_APPLICABLE_PROMOTION: createErrorCode(
    151002,
    'Error when delete applicable promotion',
  ),
  ERROR_WHEN_CREATE_APPLICABLE_PROMOTION: createErrorCode(
    151003,
    'Error when create applicable promotion',
  ),
  APPLICABLE_PROMOTION_ALREADY_EXISTED: createErrorCode(
    151004,
    'Applicable promotion already existed',
  ),
  ERROR_WHEN_GET_MENU_ITEM_BY_APPLICABLE_PROMOTION: createErrorCode(
    151005,
    'Error when get menu item by applicable promotion',
  ),
  MUST_HAVE_BOTH_PROMOTION_SLUG_AND_APPLICABLE_SLUG: createErrorCode(
    151006,
    'Must have both promotion slug and applicable slug',
  ),
  ERROR_WHEN_HANDLE_DATA_TO_DELETE_APPLICABLE_PROMOTION: createErrorCode(
    151007,
    'Error when handle data to delete applicable promotion',
  ),
};
