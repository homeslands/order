import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const USER_GROUP_MEMBER_NOT_FOUND = 'USER_GROUP_MEMBER_NOT_FOUND';
export const USER_ALREADY_IN_GROUP = 'USER_ALREADY_IN_GROUP';
export const ERROR_ADD_USER_TO_GROUP = 'ERROR_ADD_USER_TO_GROUP';
export const INACTIVE_GROUP_MEMBER = 'INACTIVE_GROUP_MEMBER';
export const INVALID_MEMBER_ROLE = 'INVALID_MEMBER_ROLE';
export const CANNOT_REMOVE_GROUP_ADMIN = 'CANNOT_REMOVE_GROUP_ADMIN';

export type TUserGroupMemberErrorCodeKey =
  | typeof USER_GROUP_MEMBER_NOT_FOUND
  | typeof USER_ALREADY_IN_GROUP
  | typeof ERROR_ADD_USER_TO_GROUP
  | typeof INACTIVE_GROUP_MEMBER
  | typeof INVALID_MEMBER_ROLE
  | typeof CANNOT_REMOVE_GROUP_ADMIN;

export type TUserGroupMemberErrorCode = Record<
  TUserGroupMemberErrorCodeKey,
  TErrorCodeValue
>;

// 159501 - 159600
export const UserGroupMemberValidation: TUserGroupMemberErrorCode = {
  USER_GROUP_MEMBER_NOT_FOUND: createErrorCode(
    159501,
    'User group member not found',
  ),
  USER_ALREADY_IN_GROUP: createErrorCode(159502, 'User already in group'),
  ERROR_ADD_USER_TO_GROUP: createErrorCode(
    159503,
    'Error when adding user to group',
  ),
  INACTIVE_GROUP_MEMBER: createErrorCode(159504, 'Group member is inactive'),
  INVALID_MEMBER_ROLE: createErrorCode(159505, 'Invalid member role'),
  CANNOT_REMOVE_GROUP_ADMIN: createErrorCode(
    159506,
    'Cannot remove group admin',
  ),
};
