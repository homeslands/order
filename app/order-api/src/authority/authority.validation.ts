import { TErrorCodeValue } from 'src/app/app.validation';

export const AUTHORITY_NOT_FOUND = 'AUTHORITY_NOT_FOUND';
export const AUTHORITY_UPDATE_FAILED = 'AUTHORITY_UPDATE_FAILED';
export const AUTHORITY_DELETE_FAILED = 'AUTHORITY_DELETE_FAILED';

export type TAuthorityErrorCodeKey =
  | typeof AUTHORITY_NOT_FOUND
  | typeof AUTHORITY_UPDATE_FAILED
  | typeof AUTHORITY_DELETE_FAILED;

// 156001- 156500
export type TAuthorityErrorCode = Record<
  TAuthorityErrorCodeKey,
  TErrorCodeValue
>;

export const AuthorityValidation: TAuthorityErrorCode = {
  [AUTHORITY_NOT_FOUND]: {
    code: 156001,
    message: 'Authority not found',
  },
  [AUTHORITY_UPDATE_FAILED]: {
    code: 156002,
    message: 'Authority update failed',
  },
  [AUTHORITY_DELETE_FAILED]: {
    code: 156003,
    message: 'Authority delete failed',
  },
};
