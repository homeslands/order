import { TErrorCodeValue } from 'src/app/app.validation';

export const AUTHORITY_GROUP_NOT_FOUND = 'AUTHORITY_GROUP_NOT_FOUND';
export const AUTHORITY_GROUP_UPDATE_FAILED = 'AUTHORITY_GROUP_UPDATE_FAILED';
export const AUTHORITY_GROUP_DELETE_FAILED = 'AUTHORITY_GROUP_DELETE_FAILED';
export type TAuthorityGroupErrorCodeKey =
  | typeof AUTHORITY_GROUP_NOT_FOUND
  | typeof AUTHORITY_GROUP_UPDATE_FAILED
  | typeof AUTHORITY_GROUP_DELETE_FAILED;

// 156501 - 157000
export type TAuthorityGroupErrorCode = Record<
  TAuthorityGroupErrorCodeKey,
  TErrorCodeValue
>;

export const AuthorityGroupValidation: TAuthorityGroupErrorCode = {
  [AUTHORITY_GROUP_NOT_FOUND]: {
    code: 156501,
    message: 'Authority group not found',
  },
  [AUTHORITY_GROUP_UPDATE_FAILED]: {
    code: 156502,
    message: 'Authority group update failed',
  },
  [AUTHORITY_GROUP_DELETE_FAILED]: {
    code: 156503,
    message: 'Authority group delete failed',
  },
};
