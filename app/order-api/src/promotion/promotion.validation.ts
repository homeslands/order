import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PROMOTION_NOT_FOUND = 'PROMOTION_NOT_FOUND';
export const DENY_DELETE_PROMOTION = 'DENY_DELETE_PROMOTION';
export const ERROR_WHEN_GET_MENU_ITEM_BY_PROMOTION =
  'ERROR_WHEN_GET_MENU_ITEM_BY_PROMOTION';
export const ERROR_WHEN_UPDATE_PROMOTION = 'ERROR_WHEN_UPDATE_PROMOTION';
export const PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_BRANCH =
  'PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_BRANCH';
export const PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_TIME =
  'PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_TIME';
export const UPDATE_END_TIME_MUST_BE_GREATER_TODAY =
  'UPDATE_END_TIME_MUST_BE_GREATER_TODAY';
export const PROMOTION_ALREADY_EXPIRED_CAN_NOT_UPDATE_TIME =
  'PROMOTION_ALREADY_EXPIRED_CAN_NOT_UPDATE_TIME';
export const END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME =
  'END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME';
export const END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY =
  'END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY';
export const PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_START_TIME =
  'PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_START_TIME';
export const ERROR_WHEN_VALIDATE_PROMOTION = 'ERROR_WHEN_VALIDATE_PROMOTION';
export const PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE =
  'PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE';

export type TPromotionErrorCodeKey =
  | typeof DENY_DELETE_PROMOTION
  | typeof ERROR_WHEN_GET_MENU_ITEM_BY_PROMOTION
  | typeof ERROR_WHEN_UPDATE_PROMOTION
  | typeof PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_BRANCH
  | typeof PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_TIME
  | typeof PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_START_TIME
  | typeof UPDATE_END_TIME_MUST_BE_GREATER_TODAY
  | typeof PROMOTION_ALREADY_EXPIRED_CAN_NOT_UPDATE_TIME
  | typeof END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME
  | typeof END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY
  | typeof PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE
  | typeof ERROR_WHEN_VALIDATE_PROMOTION
  | typeof PROMOTION_NOT_FOUND;

export type TPromotionErrorCode = Record<
  TPromotionErrorCodeKey,
  TErrorCodeValue
>;

// 150501 - 151000
export const PromotionValidation: TPromotionErrorCode = {
  PROMOTION_NOT_FOUND: createErrorCode(150501, 'Promotion not found'),
  DENY_DELETE_PROMOTION: createErrorCode(150502, 'Deny delete promotion'),
  ERROR_WHEN_GET_MENU_ITEM_BY_PROMOTION: createErrorCode(
    150503,
    'Error when get menu item by promotion',
  ),
  ERROR_WHEN_UPDATE_PROMOTION: createErrorCode(
    150504,
    'Error when update promotion',
  ),
  PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_BRANCH: createErrorCode(
    150505,
    'Promotion already applied, can not update branch',
  ),
  PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_TIME: createErrorCode(
    150506,
    'Promotion already applied, can not update time',
  ),
  PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_START_TIME: createErrorCode(
    150507,
    'Promotion already applied, can not update start time',
  ),
  UPDATE_END_TIME_MUST_BE_GREATER_TODAY: createErrorCode(
    150508,
    'Update end time must be greater than today',
  ),
  PROMOTION_ALREADY_EXPIRED_CAN_NOT_UPDATE_TIME: createErrorCode(
    150509,
    'Promotion already expired, can not update time',
  ),
  END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME: createErrorCode(
    150510,
    'End time must be greater or equal start time',
  ),
  END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY: createErrorCode(
    150511,
    'End time must be greater or equal today',
  ),
  PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE: createErrorCode(
    150512,
    'Promotion already applied, can not delete',
  ),
  ERROR_WHEN_VALIDATE_PROMOTION: createErrorCode(
    150513,
    'Error when validate promotion',
  ),
};
