import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const BANNER_NOT_FOUND = 'BANNER_NOT_FOUND';

export type TBannerErrorCodeKey = typeof BANNER_NOT_FOUND;

export type TBannerErrorCode = Record<TBannerErrorCodeKey, TErrorCodeValue>;

// 152000 - 153000
const BannerValidation: TBannerErrorCode = {
  BANNER_NOT_FOUND: createErrorCode(152000, 'Banner not found'),
};

export default BannerValidation;
