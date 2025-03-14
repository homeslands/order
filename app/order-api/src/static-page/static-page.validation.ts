import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const STATIC_PAGE_KEY_INVALID = 'STATIC_PAGE_KEY_INVALID';
export const STATIC_PAGE_CONTENT_INVALID = 'STATIC_PAGE_CONTENT_INVALID';
export const STATIC_PAGE_TITLE_INVALID = 'STATIC_PAGE_TITLE_INVALID';
export const STATIC_PAGE_KEY_ALREADY_EXIST = 'STATIC_PAGE_KEY_ALREADY_EXIST';
export const STATIC_PAGE_NOT_FOUND = 'STATIC_PAGE_NOT_FOUND';

export type TStaticPageErrorCodeKey =
  | typeof STATIC_PAGE_KEY_INVALID
  | typeof STATIC_PAGE_TITLE_INVALID
  | typeof STATIC_PAGE_KEY_ALREADY_EXIST
  | typeof STATIC_PAGE_NOT_FOUND
  | typeof STATIC_PAGE_CONTENT_INVALID;

export type TStaticPageErrorCode = Record<
  TStaticPageErrorCodeKey,
  TErrorCodeValue
>;

//150000 – 150500
export const StaticPageValidation: TStaticPageErrorCode = {
  STATIC_PAGE_KEY_INVALID: createErrorCode(150000, 'Static page key invalid'),
  STATIC_PAGE_CONTENT_INVALID: createErrorCode(
    150001,
    'Static page content invalid',
  ),
  STATIC_PAGE_TITLE_INVALID: createErrorCode(
    150002,
    'Static page title invalid',
  ),
  STATIC_PAGE_KEY_ALREADY_EXIST: createErrorCode(
    150003,
    'Static page key already exist',
  ),
  STATIC_PAGE_NOT_FOUND: createErrorCode(150004, 'Static page not found'),
};
