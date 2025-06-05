import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_RECIPIENT = 'ERROR_WHEN_CREATE_RECIPIENT';
export const RECIPIENT_NOT_FOUND = 'RECIPIENT_NOT_FOUND';
export const ERROR_WHEN_UPDATE_RECIPIENT = 'ERROR_WHEN_UPDATE_RECIPIENT';
export const ERROR_WHEN_REMOVE_RECIPIENT = 'ERROR_WHEN_REMOVE_RECIPIENT';

export type TRecipientErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_RECIPIENT
  | typeof RECIPIENT_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_RECIPIENT
  | typeof ERROR_WHEN_REMOVE_RECIPIENT;

// 158301- 158400
export type TRecipientErrorCode = Record<
  TRecipientErrorCodeKey,
  TErrorCodeValue
>;

export const RecipientValidation: TRecipientErrorCode = {
  ERROR_WHEN_CREATE_RECIPIENT: createErrorCode(
    158301,
    'Error when create recipient',
  ),
  RECIPIENT_NOT_FOUND: createErrorCode(158302, 'Recipient not found'),
  ERROR_WHEN_UPDATE_RECIPIENT: createErrorCode(
    158303,
    'Error when update recipient',
  ),
  ERROR_WHEN_REMOVE_RECIPIENT: createErrorCode(
    158304,
    'Error when remove recipient',
  ),
};
