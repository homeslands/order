import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_GIFT_CARD = 'ERROR_WHEN_CREATE_GIFT_CARD';
export const GIFT_CARD_NOT_FOUND = 'GIFT_CARD_NOT_FOUND';
export const ERROR_WHEN_UPDATE_GIFT_CARD = 'ERROR_WHEN_UPDATE_GIFT_CARD';
export const ERROR_WHEN_REMOVE_GIFT_CARD = 'ERROR_WHEN_REMOVE_GIFT_CARD';
export const GC_IS_NOT_AVAILABLE = 'GC_IS_NOT_AVAILABLE';
export const ERROR_WHEN_USE_GIFT_CARD = 'ERROR_WHEN_USE_GIFT_CARD';
export const ERROR_WHEN_GEN_GIFT_CARD = 'ERROR_WHEN_GEN_GIFT_CARD';
export const GC_EXPIRED = 'GC_EXPIRED';
export const GC_USED = 'GC_USED';

export type TGiftCardErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_GIFT_CARD
  | typeof GIFT_CARD_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_GIFT_CARD
  | typeof ERROR_WHEN_REMOVE_GIFT_CARD
  | typeof GC_IS_NOT_AVAILABLE
  | typeof ERROR_WHEN_USE_GIFT_CARD
  | typeof ERROR_WHEN_GEN_GIFT_CARD
  | typeof GC_EXPIRED
  | typeof GC_USED;

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
  GC_IS_NOT_AVAILABLE: createErrorCode(158405, 'Gift card is not availabel'),
  ERROR_WHEN_USE_GIFT_CARD: createErrorCode(
    158406,
    'Error when using gift card',
  ),
  ERROR_WHEN_GEN_GIFT_CARD: createErrorCode(
    158407,
    'Error when generating gift card',
  ),
  GC_EXPIRED: createErrorCode(158408, 'Gift card expired'),
  GC_USED: createErrorCode(158409, 'Gift card used'),
};
