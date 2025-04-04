import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const MENU_NOT_FOUND = 'MENU_NOT_FOUND';
export const TEMPLATE_EXIST = 'TEMPLATE_EXIST';
export const INVALID_DATE = 'INVALID_DATE';
export const CREATE_MENU_FAILED = 'CREATE_MENU_FAILED';
export const UPDATE_MENU_FAILED = 'UPDATE_MENU_FAILED';

export type TMenuErrorCodeKey =
  | typeof INVALID_DATE
  | typeof TEMPLATE_EXIST
  | typeof MENU_NOT_FOUND
  | typeof CREATE_MENU_FAILED
  | typeof UPDATE_MENU_FAILED;

export type TMenuErrorCode = Record<TMenuErrorCodeKey, TErrorCodeValue>;

// 117000 - 118000
export const MenuValidation: TMenuErrorCode = {
  INVALID_DATE: createErrorCode(117001, 'Date is invalid'),
  MENU_NOT_FOUND: createErrorCode(117002, 'Menu not found'),
  TEMPLATE_EXIST: createErrorCode(117003, 'Template menu already exist'),
  CREATE_MENU_FAILED: createErrorCode(117004, 'Create menu failed'),
  UPDATE_MENU_FAILED: createErrorCode(117005, 'Update menu failed'),
};
