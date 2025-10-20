import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const VOUCHER_USER_GROUP_ALREADY_EXISTS =
  'VOUCHER_USER_GROUP_ALREADY_EXISTS';
export const CREATE_VOUCHER_USER_GROUP_FAILED =
  'CREATE_VOUCHER_USER_GROUP_FAILED';
export const VOUCHER_USER_GROUP_NOT_FOUND = 'VOUCHER_USER_GROUP_NOT_FOUND';
export const DELETE_VOUCHER_USER_GROUP_FAILED =
  'DELETE_VOUCHER_USER_GROUP_FAILED';
export const CAN_NOT_ADD_PUBLIC_VOUCHER_TO_USER_GROUP =
  'CAN_NOT_ADD_PUBLIC_VOUCHER_TO_USER_GROUP';
export const VOUCHER_IS_NOT_FOR_USER_GROUP = 'VOUCHER_IS_NOT_FOR_USER_GROUP';
export type TVoucherUserGroupErrorCodeKey =
  | typeof VOUCHER_USER_GROUP_ALREADY_EXISTS
  | typeof CREATE_VOUCHER_USER_GROUP_FAILED
  | typeof VOUCHER_USER_GROUP_NOT_FOUND
  | typeof DELETE_VOUCHER_USER_GROUP_FAILED
  | typeof CAN_NOT_ADD_PUBLIC_VOUCHER_TO_USER_GROUP
  | typeof VOUCHER_IS_NOT_FOR_USER_GROUP;
export type TVoucherUserGroupErrorCode = Record<
  TVoucherUserGroupErrorCodeKey,
  TErrorCodeValue
>;

// 159601 - 159700
export const VoucherUserGroupValidation: TVoucherUserGroupErrorCode = {
  VOUCHER_USER_GROUP_ALREADY_EXISTS: createErrorCode(
    159601,
    'Voucher user group already exists',
  ),
  CREATE_VOUCHER_USER_GROUP_FAILED: createErrorCode(
    159602,
    'Failed to create voucher user group',
  ),
  VOUCHER_USER_GROUP_NOT_FOUND: createErrorCode(
    159603,
    'Voucher user group not found',
  ),
  DELETE_VOUCHER_USER_GROUP_FAILED: createErrorCode(
    159604,
    'Failed to delete voucher user group',
  ),
  CAN_NOT_ADD_PUBLIC_VOUCHER_TO_USER_GROUP: createErrorCode(
    159605,
    'Can not add public voucher to user group',
  ),
  VOUCHER_IS_NOT_FOR_USER_GROUP: createErrorCode(
    159606,
    'Voucher is not for user group',
  ),
};
