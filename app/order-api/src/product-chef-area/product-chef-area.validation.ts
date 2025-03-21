import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PRODUCT_CHEF_AREA_NOT_FOUND = 'PRODUCT_CHEF_AREA_NOT_FOUND';

export type TProductChefAreaErrorCodeKey = typeof PRODUCT_CHEF_AREA_NOT_FOUND;

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
};

export default ProductChefAreaValidation;
