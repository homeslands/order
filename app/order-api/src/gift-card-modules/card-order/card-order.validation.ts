import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_CARD_ORDER = 'ERROR_WHEN_CREATE_CARD_ORDER';
export const CARD_ORDER_NOT_FOUND = 'CARD_ORDER_NOT_FOUND';
export const ERROR_WHEN_UPDATE_CARD_ORDER = 'ERROR_WHEN_UPDATE_CARD_ORDER';
export const ERROR_WHEN_REMOVE_CARD_ORDER = 'ERROR_WHEN_REMOVE_CARD_ORDER';

export type TCardOrderErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_CARD_ORDER
  | typeof CARD_ORDER_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_CARD_ORDER
  | typeof ERROR_WHEN_REMOVE_CARD_ORDER;

// 158101- 158200
export type TCardOrderErrorCode = Record<
  TCardOrderErrorCodeKey,
  TErrorCodeValue
>;

export const CardOrderValidation: TCardOrderErrorCode = {
  ERROR_WHEN_CREATE_CARD_ORDER: createErrorCode(
    158101,
    'Error when create card order',
  ),
  CARD_ORDER_NOT_FOUND: createErrorCode(158102, 'Card order not found'),
  ERROR_WHEN_UPDATE_CARD_ORDER: createErrorCode(
    158103,
    'Error when update card order',
  ),
  ERROR_WHEN_REMOVE_CARD_ORDER: createErrorCode(
    158104,
    'Error when remove card order',
  ),
};
