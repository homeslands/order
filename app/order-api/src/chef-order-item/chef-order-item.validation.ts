import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CHEF_ORDER_ITEM_NOT_FOUND = 'CHEF_ORDER_ITEM_NOT_FOUND';
export const ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS =
  'ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS';
export const ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER =
  'ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER';

export type TChefOrderItemErrorCodeKey =
  | typeof ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS
  | typeof ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER
  | typeof CHEF_ORDER_ITEM_NOT_FOUND;

export type TChefOrderItemErrorCode = Record<
  TChefOrderItemErrorCodeKey,
  TErrorCodeValue
>;

// 155001 - 155500
const ChefOrderItemValidation: TChefOrderItemErrorCode = {
  CHEF_ORDER_ITEM_NOT_FOUND: createErrorCode(
    155001,
    'Chef order item not found',
  ),
  ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS: createErrorCode(
    155002,
    'Error when update multi chef order items',
  ),
  ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER: createErrorCode(
    155003,
    'All chef order items must be belong to an chef order',
  ),
};

export default ChefOrderItemValidation;
