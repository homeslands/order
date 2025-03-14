import { TErrorCodeValue } from 'src/app/app.validation';

export type TAuthorityErrorCodeKey = null;

// 153001 - 155000
export type TAuthorityErrorCode = Record<
  TAuthorityErrorCodeKey,
  TErrorCodeValue
>;

export const AuthorityValidation: TAuthorityErrorCode = {};
