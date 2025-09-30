import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const USER_GROUP_NOT_FOUND = 'USER_GROUP_NOT_FOUND';
export const USER_GROUP_ALREADY_EXISTS = 'USER_GROUP_ALREADY_EXISTS';
export const ERROR_CREATE_USER_GROUP = 'ERROR_CREATE_USER_GROUP';
export const USER_GROUP_HAS_MEMBERS = 'USER_GROUP_HAS_MEMBERS';
export const USER_GROUP_INACTIVE = 'USER_GROUP_INACTIVE';
export const USER_GROUP_NAME_ALREADY_EXISTS = 'USER_GROUP_NAME_ALREADY_EXISTS';

export type TUserGroupErrorCodeKey =
  | typeof USER_GROUP_NOT_FOUND
  | typeof USER_GROUP_ALREADY_EXISTS
  | typeof ERROR_CREATE_USER_GROUP
  | typeof USER_GROUP_HAS_MEMBERS
  | typeof USER_GROUP_INACTIVE
  | typeof USER_GROUP_NAME_ALREADY_EXISTS;

export type TUserGroupErrorCode = Record<
  TUserGroupErrorCodeKey,
  TErrorCodeValue
>;

// 159401 - 159500
export const UserGroupValidation: TUserGroupErrorCode = {
  USER_GROUP_NOT_FOUND: createErrorCode(159401, 'User group not found'),
  USER_GROUP_ALREADY_EXISTS: createErrorCode(
    159402,
    'User group already exists',
  ),
  ERROR_CREATE_USER_GROUP: createErrorCode(
    159403,
    'Error when creating user group',
  ),
  USER_GROUP_HAS_MEMBERS: createErrorCode(
    159404,
    'Cannot delete group with members',
  ),
  USER_GROUP_INACTIVE: createErrorCode(159405, 'User group is inactive'),
  USER_GROUP_NAME_ALREADY_EXISTS: createErrorCode(
    159406,
    'User group name already exists',
  ),
};
