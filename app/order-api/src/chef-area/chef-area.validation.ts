import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CHEF_AREA_NOT_FOUND = 'CHEF_AREA_NOT_FOUND';

export type TChefAreaErrorCodeKey = typeof CHEF_AREA_NOT_FOUND;

export type TChefAreaErrorCode = Record<TChefAreaErrorCodeKey, TErrorCodeValue>;

// 153501 - 154000
const ChefAreaValidation: TChefAreaErrorCode = {
  CHEF_AREA_NOT_FOUND: createErrorCode(153501, 'Chef area not found'),
};

export default ChefAreaValidation;
