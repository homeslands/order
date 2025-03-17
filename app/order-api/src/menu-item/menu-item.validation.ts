import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const MENU_ITEM_NOT_FOUND = 'MENU_ITEM_NOT_FOUND';
export const MENU_ITEM_EXIST = 'MENU_ITEM_EXIST';
export const UPDATE_MENU_ITEM_ERROR = 'UPDATE_MENU_ITEM_ERROR';
export const INVALID_ACTION = 'INVALID_ACTION';
export const MENU_ITEM_IS_LOCKED = 'MENU_ITEM_IS_LOCKED';

export type TMenuItemErrorCodeKey =
  | typeof MENU_ITEM_NOT_FOUND
  | typeof UPDATE_MENU_ITEM_ERROR
  | typeof INVALID_ACTION
  | typeof MENU_ITEM_IS_LOCKED
  | typeof MENU_ITEM_EXIST;

export type TMenuItemErrorCode = Record<TMenuItemErrorCodeKey, TErrorCodeValue>;

// 113000 - 114000
export const MenuItemValidation: TMenuItemErrorCode = {
  MENU_ITEM_NOT_FOUND: createErrorCode(113000, 'Menu item not found'),
  MENU_ITEM_EXIST: createErrorCode(113001, 'Menu item existed'),
  UPDATE_MENU_ITEM_ERROR: createErrorCode(
    113002,
    'Error when updating menu item',
  ),
  INVALID_ACTION: createErrorCode(113003, 'Invalid action'),
  MENU_ITEM_IS_LOCKED: createErrorCode(113004, 'Menu item is locked'),
};
