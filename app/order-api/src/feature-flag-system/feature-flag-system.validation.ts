import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const FEATURE_FLAG_SYSTEM_NOT_FOUND = 'FEATURE_FLAG_SYSTEM_NOT_FOUND';
export const ERROR_WHEN_UPDATE_FEATURE_FLAG_SYSTEM =
  'ERROR_WHEN_UPDATE_FEATURE_FLAG_SYSTEM';
export const FEATURE_IS_LOCKED = 'FEATURE_IS_LOCKED';

export type TBranchErrorCodeKey =
  | typeof FEATURE_FLAG_SYSTEM_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_FEATURE_FLAG_SYSTEM
  | typeof FEATURE_IS_LOCKED;

// 159201 - 159300
export type TFeatureFlagSystemErrorCode = Record<
  TBranchErrorCodeKey,
  TErrorCodeValue
>;

export const FeatureFlagSystemValidation: TFeatureFlagSystemErrorCode = {
  FEATURE_FLAG_SYSTEM_NOT_FOUND: createErrorCode(
    159201,
    'Feature flag system not found',
  ),
  ERROR_WHEN_UPDATE_FEATURE_FLAG_SYSTEM: createErrorCode(
    159202,
    'Error when update feature flag system',
  ),
  FEATURE_IS_LOCKED: createErrorCode(159203, 'Feature is locked'),
};
