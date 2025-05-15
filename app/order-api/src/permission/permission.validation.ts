import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PERMISSION_EXISTED = 'PERMISSION_EXISTED';
export const PERMISSION_CREATE_FAILED = 'PERMISSION_CREATE_FAILED';
export const PERMISSION_REMOVE_FAILED = 'PERMISSION_REMOVE_FAILED';

export type TPermissionErrorCodeKey =
  | typeof PERMISSION_EXISTED
  | typeof PERMISSION_REMOVE_FAILED
  | typeof PERMISSION_CREATE_FAILED;

export type TPermissionErrorCode = Record<
  TPermissionErrorCodeKey,
  TErrorCodeValue
>;

// 153001- 153500
export const PermissionValidation: TPermissionErrorCode = {
  PERMISSION_EXISTED: createErrorCode(153001, 'Permission existed'),
  PERMISSION_CREATE_FAILED: createErrorCode(
    153002,
    'Failed to create permission',
  ),
  PERMISSION_REMOVE_FAILED: createErrorCode(
    153003,
    'Failed to remove permission',
  ),
};
