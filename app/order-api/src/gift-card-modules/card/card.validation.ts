import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_CARD = 'ERROR_WHEN_CREATE_CARD';
export const CARD_NOT_FOUND = 'CARD_NOT_FOUND';
export const ERROR_WHEN_UPDATE_CARD = 'ERROR_WHEN_UPDATE_CARD';
export const ERROR_WHEN_REMOVE_CARD = 'ERROR_WHEN_REMOVE_CARD';

export type TCardErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_CARD
  | typeof CARD_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_CARD
  | typeof ERROR_WHEN_REMOVE_CARD;

// 105000 - 106000
export type TCardErrorCode = Record<TCardErrorCodeKey, TErrorCodeValue>;

export const CardValidation: TCardErrorCode = {
  ERROR_WHEN_CREATE_CARD: createErrorCode(105000, 'Error when create card'),
  CARD_NOT_FOUND: createErrorCode(105001, 'Card not found'),
  ERROR_WHEN_UPDATE_CARD: createErrorCode(105002, 'Error when update card'),
  ERROR_WHEN_REMOVE_CARD: createErrorCode(105003, 'Error when remove card'),
};
