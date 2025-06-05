import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_GIFT_CARD = 'ERROR_WHEN_CREATE_GIFT_CARD';
export const GIFT_CARD_NOT_FOUND = 'GIFT_CARD_NOT_FOUND';
export const ERROR_WHEN_UPDATE_GIFT_CARD = 'ERROR_WHEN_UPDATE_GIFT_CARD';
export const ERROR_WHEN_REMOVE_GIFT_CARD = 'ERROR_WHEN_REMOVE_GIFT_CARD';

export type TGiftCardErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_GIFT_CARD
  | typeof GIFT_CARD_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_GIFT_CARD
  | typeof ERROR_WHEN_REMOVE_GIFT_CARD;

// 158401 - 158500
export type TGiftCardErrorCode = Record<TGiftCardErrorCodeKey, TErrorCodeValue>;

export const GiftCardValidation: TGiftCardErrorCode = {
  ERROR_WHEN_CREATE_GIFT_CARD: createErrorCode(
    158401,
    'Error when create gift card',
  ),
  GIFT_CARD_NOT_FOUND: createErrorCode(158402, 'Gift card not found'),
  ERROR_WHEN_UPDATE_GIFT_CARD: createErrorCode(
    158403,
    'Error when update gift card',
  ),
  ERROR_WHEN_REMOVE_GIFT_CARD: createErrorCode(
    158404,
    'Error when remove gift card',
  ),
};
