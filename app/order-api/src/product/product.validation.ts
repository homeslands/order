import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND';
export const PRODUCT_NAME_EXIST = 'PRODUCT_NAME_EXIST';
export const PRODUCT_NAME_REQUIRED = 'PRODUCT_NAME_REQUIRED';
export const PRODUCT_LIMIT_REQUIRED = 'PRODUCT_LIMIT_REQUIRED';
export const PRODUCT_ACTIVE_REQUIRED = 'PRODUCT_ACTIVE_REQUIRED';
export const PRODUCT_NOT_FOUND_IN_TODAY_MENU =
  'PRODUCT_NOT_FOUND_IN_TODAY_MENU';

export type TProductErrorCodeKey =
  | typeof PRODUCT_NOT_FOUND
  | typeof PRODUCT_NAME_EXIST
  | typeof PRODUCT_LIMIT_REQUIRED
  | typeof PRODUCT_ACTIVE_REQUIRED
  | typeof PRODUCT_NAME_REQUIRED
  | typeof PRODUCT_NOT_FOUND_IN_TODAY_MENU;

export type TProductErrorCode = Record<TProductErrorCodeKey, TErrorCodeValue>;

// 115000 - 116000
const ProductValidation: TProductErrorCode = {
  PRODUCT_NOT_FOUND: createErrorCode(115000, 'Product not found'),
  PRODUCT_NAME_EXIST: createErrorCode(115001, 'Product name is existed'),
  PRODUCT_NAME_REQUIRED: createErrorCode(115002, 'Name product is required'),
  PRODUCT_LIMIT_REQUIRED: createErrorCode(
    115003,
    'The limit of product is required',
  ),
  PRODUCT_ACTIVE_REQUIRED: createErrorCode(
    115004,
    'The active of product is required',
  ),
  PRODUCT_NOT_FOUND_IN_TODAY_MENU: createErrorCode(
    115005,
    `The product is not found in today's menu`,
  ),
};

export default ProductValidation;
