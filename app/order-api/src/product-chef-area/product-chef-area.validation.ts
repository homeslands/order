import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PRODUCT_CHEF_AREA_NOT_FOUND = 'PRODUCT_CHEF_AREA_NOT_FOUND';
export const PRODUCT_ALREADY_EXISTS_ONE_CHEF_AREA_IN_THIS_BRANCH =
  'PRODUCT_ALREADY_EXISTS_ONE_CHEF_AREA_IN_THIS_BRANCH';
export const ERROR_WHEN_CREATE_MANY_PRODUCT_CHEF_AREAS =
  'ERROR_WHEN_CREATE_MANY_PRODUCT_CHEF_AREAS';

export type TProductChefAreaErrorCodeKey =
  | typeof PRODUCT_ALREADY_EXISTS_ONE_CHEF_AREA_IN_THIS_BRANCH
  | typeof ERROR_WHEN_CREATE_MANY_PRODUCT_CHEF_AREAS
  | typeof PRODUCT_CHEF_AREA_NOT_FOUND;

export type TProductChefAreaErrorCode = Record<
  TProductChefAreaErrorCodeKey,
  TErrorCodeValue
>;

// 154001 - 154500
const ProductChefAreaValidation: TProductChefAreaErrorCode = {
  PRODUCT_CHEF_AREA_NOT_FOUND: createErrorCode(
    154001,
    'Product chef area not found',
  ),
  PRODUCT_ALREADY_EXISTS_ONE_CHEF_AREA_IN_THIS_BRANCH: createErrorCode(
    154002,
    'Product already exists one chef area in this branch',
  ),
  ERROR_WHEN_CREATE_MANY_PRODUCT_CHEF_AREAS: createErrorCode(
    154003,
    'Error when create many product chef areas',
  ),
};

export default ProductChefAreaValidation;
