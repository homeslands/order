import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const BANNER_NOT_FOUND = 'BANNER_NOT_FOUND';
export const CREATE_BANNER_FAILED = 'CREATE_BANNER_FAILED';
export const UPDATE_BANNER_FAILED = 'UPDATE_BANNER_FAILED';

export type TBannerErrorCodeKey =
  | typeof BANNER_NOT_FOUND
  | typeof CREATE_BANNER_FAILED
  | typeof UPDATE_BANNER_FAILED;

export type TBannerErrorCode = Record<TBannerErrorCodeKey, TErrorCodeValue>;

// 152000 - 153000
const BannerValidation: TBannerErrorCode = {
  BANNER_NOT_FOUND: createErrorCode(152000, 'Banner not found'),
  CREATE_BANNER_FAILED: createErrorCode(152001, 'Create banner failed'),
  UPDATE_BANNER_FAILED: createErrorCode(152002, 'Update banner failed'),
};

export default BannerValidation;
