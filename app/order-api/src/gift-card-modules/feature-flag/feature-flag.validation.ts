import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_FEATURE_FLAG = 'ERROR_WHEN_CREATE_FEATURE_FLAG';
export const FEATURE_FLAG_NOT_FOUND = 'FEATURE_FLAG_NOT_FOUND';
export const ERROR_WHEN_UPDATE_FEATURE_FLAG = 'ERROR_WHEN_UPDATE_FEATURE_FLAG';
export const ERROR_WHEN_REMOVE_FEATURE_FLAG = 'ERROR_WHEN_REMOVE_FEATURE_FLAG';
export const MISSING_PARAMS = 'MISSING_PARAMS';
export const FEATURE_IS_LOCKED = 'FEATURE_IS_LOCKED';

export type TFeatureFlagErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_FEATURE_FLAG
  | typeof FEATURE_FLAG_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_FEATURE_FLAG
  | typeof ERROR_WHEN_REMOVE_FEATURE_FLAG
  | typeof MISSING_PARAMS
  | typeof FEATURE_IS_LOCKED;

// 158801- 158900
export type TFeatureFlagErrorCode = Record<
  TFeatureFlagErrorCodeKey,
  TErrorCodeValue
>;

export const FeatureFlagValidation: TFeatureFlagErrorCode = {
  ERROR_WHEN_CREATE_FEATURE_FLAG: createErrorCode(
    158801,
    'Error when create feature flag',
  ),
  FEATURE_FLAG_NOT_FOUND: createErrorCode(158802, 'Card order not found'),
  ERROR_WHEN_UPDATE_FEATURE_FLAG: createErrorCode(
    158803,
    'Error when update feature flag',
  ),
  ERROR_WHEN_REMOVE_FEATURE_FLAG: createErrorCode(
    158804,
    'Error when remove feature flag',
  ),
  MISSING_PARAMS: createErrorCode(
    158805,
    'Either slug or name parameter is required.',
  ),
  FEATURE_IS_LOCKED: createErrorCode(
    158806,
    'The feature is temporarily locked.',
  ),
};
