import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const MENU_ITEM_NOT_FOUND = 'MENU_ITEM_NOT_FOUND';
export const MENU_ITEM_EXIST = 'MENU_ITEM_EXIST';
export const UPDATE_MENU_ITEM_ERROR = 'UPDATE_MENU_ITEM_ERROR';
export const INVALID_ACTION = 'INVALID_ACTION';
export const MENU_ITEM_IS_LOCKED = 'MENU_ITEM_IS_LOCKED';
export const UPDATE_CURRENT_STOCK_MUST_LARGER_OR_EQUAL_EXISTED_CURRENT_STOCK =
  'UPDATE_CURRENT_STOCK_MUST_LARGER_OR_EQUAL_EXISTED_CURRENT_STOCK';
export const PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA_OF_THIS_BRANCH =
  'PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA_OF_THIS_BRANCH';
export type TMenuItemErrorCodeKey =
  | typeof MENU_ITEM_NOT_FOUND
  | typeof UPDATE_MENU_ITEM_ERROR
  | typeof INVALID_ACTION
  | typeof MENU_ITEM_IS_LOCKED
  | typeof UPDATE_CURRENT_STOCK_MUST_LARGER_OR_EQUAL_EXISTED_CURRENT_STOCK
  | typeof MENU_ITEM_EXIST
  | typeof PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA_OF_THIS_BRANCH;

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
  UPDATE_CURRENT_STOCK_MUST_LARGER_OR_EQUAL_EXISTED_CURRENT_STOCK:
    createErrorCode(
      113005,
      'Update current stock must larger or equal existed current stock',
    ),
  PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA_OF_THIS_BRANCH: createErrorCode(
    113006,
    'Product not belong to any chef area of this branch',
  ),
};
