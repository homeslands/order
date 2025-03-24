import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CHEF_ORDER_ITEM_NOT_FOUND = 'CHEF_ORDER_ITEM_NOT_FOUND';

export type TChefOrderItemErrorCodeKey = typeof CHEF_ORDER_ITEM_NOT_FOUND;

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
};

export default ChefOrderItemValidation;
