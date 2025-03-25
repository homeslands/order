import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CHEF_AREA_NOT_FOUND = 'CHEF_AREA_NOT_FOUND';
export const NOT_FOUND_ANY_CHEF_AREAS_IN_THIS_BRANCH =
  'NOT_FOUND_ANY_CHEF_AREAS_IN_THIS_BRANCH';

export type TChefAreaErrorCodeKey =
  | typeof NOT_FOUND_ANY_CHEF_AREAS_IN_THIS_BRANCH
  | typeof CHEF_AREA_NOT_FOUND;

export type TChefAreaErrorCode = Record<TChefAreaErrorCodeKey, TErrorCodeValue>;

// 153501 - 154000
const ChefAreaValidation: TChefAreaErrorCode = {
  CHEF_AREA_NOT_FOUND: createErrorCode(153501, 'Chef area not found'),
  NOT_FOUND_ANY_CHEF_AREAS_IN_THIS_BRANCH: createErrorCode(
    153502,
    'Not found any chef areas in this branch',
  ),
};

export default ChefAreaValidation;
