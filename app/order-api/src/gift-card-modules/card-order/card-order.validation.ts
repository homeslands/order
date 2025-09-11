import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_CREATE_CARD_ORDER = 'ERROR_WHEN_CREATE_CARD_ORDER';
export const CARD_ORDER_NOT_FOUND = 'CARD_ORDER_NOT_FOUND';
export const ERROR_WHEN_UPDATE_CARD_ORDER = 'ERROR_WHEN_UPDATE_CARD_ORDER';
export const ERROR_WHEN_REMOVE_CARD_ORDER = 'ERROR_WHEN_REMOVE_CARD_ORDER';
export const CARD_ORDER_CUSTOMER_NOT_FOUND = 'CARD_ORDER_CUSTOMER_NOT_FOUND';
export const CARD_ORDER_TOTAL_AMOUNT_NOT_CORRECT =
  'CARD_ORDER_TOTAL_AMOUNT_NOT_CORRECT';
export const CARD_ORDER_TOTAL_QUANTITY_NOT_CORRECT =
  'CARD_ORDER_TOTAL_QUANTITY_NOT_CORRECT';
export const CARD_ORDER_RECIPIENT_NOT_FOUND = 'CARD_ORDER_RECIPIENT_NOT_FOUND';
export const CARD_ORDER_NOT_PENDING = 'CARD_ORDER_NOT_PENDING';
export const INVALID_CARD_ORDER_TYPE = 'INVALID_CARD_ORDER_TYPE';
export const INVALID_CARD_ORDER_SLUG = 'INVALID_CARD_ORDER_SLUG';
export const CARD_ORDER_HAS_ALREADY_PAYMENT = 'CARD_ORDER_HAS_ALREADY_PAYMENT';
export const CARD_IS_NOT_ACTIVE = 'CARD_IS_NOT_ACTIVE';
export const GIFT_CARD_HAS_ALREADY_GENERATED =
  'GIFT_CARD_HAS_ALREADY_GENERATED';
export const INVALID_CARD_ORDER_STATUS = 'INVALID_CARD_ORDER_STATUS';
export const INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD';
export const INVALID_CASHIER_SLUG = "INVALID_CASHIER_SLUG";
export const CASHIER_NOT_FOUND = 'CASHIER_NOT_FOUND';

export type TCardOrderErrorCodeKey =
  | typeof ERROR_WHEN_CREATE_CARD_ORDER
  | typeof CARD_ORDER_NOT_FOUND
  | typeof ERROR_WHEN_UPDATE_CARD_ORDER
  | typeof ERROR_WHEN_REMOVE_CARD_ORDER
  | typeof CARD_ORDER_CUSTOMER_NOT_FOUND
  | typeof CARD_ORDER_TOTAL_AMOUNT_NOT_CORRECT
  | typeof CARD_ORDER_TOTAL_QUANTITY_NOT_CORRECT
  | typeof CARD_ORDER_RECIPIENT_NOT_FOUND
  | typeof CARD_ORDER_NOT_PENDING
  | typeof INVALID_CARD_ORDER_TYPE
  | typeof INVALID_CARD_ORDER_SLUG
  | typeof CARD_ORDER_HAS_ALREADY_PAYMENT
  | typeof CARD_IS_NOT_ACTIVE
  | typeof GIFT_CARD_HAS_ALREADY_GENERATED
  | typeof INVALID_CARD_ORDER_STATUS
  | typeof GIFT_CARD_HAS_ALREADY_GENERATED
  | typeof INVALID_PAYMENT_METHOD
  | typeof INVALID_CASHIER_SLUG
  | typeof CASHIER_NOT_FOUND;

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
  CARD_ORDER_CUSTOMER_NOT_FOUND: createErrorCode(158105, 'Customer not found'),
  CARD_ORDER_TOTAL_AMOUNT_NOT_CORRECT: createErrorCode(
    158106,
    'Total amount not correct',
  ),
  CARD_ORDER_TOTAL_QUANTITY_NOT_CORRECT: createErrorCode(
    158107,
    'Total quantity not correct',
  ),
  CARD_ORDER_RECIPIENT_NOT_FOUND: createErrorCode(
    158108,
    'Recipient not found',
  ),
  CARD_ORDER_NOT_PENDING: createErrorCode(158109, 'Card order not pending'),
  INVALID_CARD_ORDER_TYPE: createErrorCode(
    158110,
    'Card order type must be one of the following: [GIFT, SELF, BUY]',
  ),
  CARD_ORDER_HAS_ALREADY_PAYMENT: createErrorCode(
    158111,
    'Card order has already payment',
  ),
  INVALID_CARD_ORDER_SLUG: createErrorCode(158112, 'Invalid card order slug'),
  CARD_IS_NOT_ACTIVE: createErrorCode(
    158113,
    'Your card is currently inactive. Please activate it to proceed.',
  ),
  GIFT_CARD_HAS_ALREADY_GENERATED: createErrorCode(
    158114,
    'Gift cards have already generated',
  ),
  INVALID_CARD_ORDER_STATUS: createErrorCode(
    158115,
    'Card order status must be one of the following: [pending, completed, fail, cancelled]',
  ),
  INVALID_PAYMENT_METHOD: createErrorCode(
    158116,
    'Invalid payment method',
  ),
  INVALID_CASHIER_SLUG: createErrorCode(
    158117,
    'Invalid cashier slug',
  ),
  CASHIER_NOT_FOUND: createErrorCode(
    158118,
    'Cashier not found',
  ),
};
