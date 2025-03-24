import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA =
  'ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA';
export const CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER =
  'CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER';

export type TChefOrderErrorCodeKey =
  | typeof ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA
  | typeof CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER;

export type TChefOrderErrorCode = Record<
  TChefOrderErrorCodeKey,
  TErrorCodeValue
>;

// 154501 - 15500
const ChefOrderValidation: TChefOrderErrorCode = {
  ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA: createErrorCode(
    154501,
    'Error data duplicate product and branch in product chef area',
  ),
  CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER: createErrorCode(
    154502,
    'Chef orders already exist from this order',
  ),
};

export default ChefOrderValidation;
