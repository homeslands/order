import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ROLE_NOT_FOUND = 'ROLE_NOT_FOUND';
export const ROLE_CREATE_FAILED = 'ROLE_CREATE_FAILED';
export const ROLE_UPDATE_FAILED = 'ROLE_UPDATE_FAILED';
export const ROLE_REMOVE_FAILED = 'ROLE_REMOVE_FAILED';

export type TRoleErrorCodeKey =
  | typeof ROLE_NOT_FOUND
  | typeof ROLE_UPDATE_FAILED
  | typeof ROLE_REMOVE_FAILED
  | typeof ROLE_CREATE_FAILED;
export type TRoleErrorCode = Record<TRoleErrorCodeKey, TErrorCodeValue>;

// 139000 - 139500
export const RoleValidation: TRoleErrorCode = {
  ROLE_NOT_FOUND: createErrorCode(139000, 'Role not found'),
  ROLE_CREATE_FAILED: createErrorCode(139001, 'Failed to create role'),
  ROLE_UPDATE_FAILED: createErrorCode(139002, 'Failed to update role'),
  ROLE_REMOVE_FAILED: createErrorCode(139003, 'Failed to remove role'),
};
