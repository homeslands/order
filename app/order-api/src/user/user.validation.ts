import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const ERROR_CREATE_USER = 'ERROR_CREATE_USER';

export type TUserErrorCodeKey =
  | typeof USER_NOT_FOUND
  | typeof ERROR_CREATE_USER;
export type TUserErrorCode = Record<TUserErrorCodeKey, TErrorCodeValue>;

// 137000 - 138000
export const UserValidation: TUserErrorCode = {
  USER_NOT_FOUND: createErrorCode(137000, 'User not found'),
  ERROR_CREATE_USER: createErrorCode(137001, 'Error when creating user'),
};
