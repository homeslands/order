import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CHEF_ORDER_ITEM_NOT_FOUND = 'CHEF_ORDER_ITEM_NOT_FOUND';
export const ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS =
  'ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS';
export const ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER =
  'ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER';
export const ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED =
  'ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED';

export type TChefOrderItemErrorCodeKey =
  | typeof ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS
  | typeof ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER
  | typeof ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED
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
  ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED:
    createErrorCode(
      155004,
      'Only update chef order item status when chef order status is accepted',
    ),
};

export default ChefOrderItemValidation;
