import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA =
  'ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA';
export const CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER =
  'CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER';
export const CHEF_ORDER_NOT_FOUND = 'CHEF_ORDER_NOT_FOUND';
export const CHEF_ORDER_STATUS_EXCEPT_COMPLETED =
  'CHEF_ORDER_STATUS_EXCEPT_COMPLETED';
export const CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING =
  'CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING';

export type TChefOrderErrorCodeKey =
  | typeof ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA
  | typeof CHEF_ORDER_NOT_FOUND
  | typeof CHEF_ORDER_STATUS_EXCEPT_COMPLETED
  | typeof CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING
  | typeof CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER;

export type TChefOrderErrorCode = Record<
  TChefOrderErrorCodeKey,
  TErrorCodeValue
>;

// 154501 - 155000
const ChefOrderValidation: TChefOrderErrorCode = {
  ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA: createErrorCode(
    154501,
    'Error data duplicate product and branch in product chef area',
  ),
  CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER: createErrorCode(
    154502,
    'Chef orders already exist from this order',
  ),
  CHEF_ORDER_NOT_FOUND: createErrorCode(154503, 'Chef order not found'),
  CHEF_ORDER_STATUS_EXCEPT_COMPLETED: createErrorCode(
    154504,
    'Chef order status except completed',
  ),
  CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING: createErrorCode(
    154505,
    'Chef order status can not change to pending',
  ),
};

export default ChefOrderValidation;
