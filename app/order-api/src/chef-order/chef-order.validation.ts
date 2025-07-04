import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA =
  'ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA';
export const CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER =
  'CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER';
export const CHEF_ORDER_NOT_FOUND = 'CHEF_ORDER_NOT_FOUND';
export const ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED =
  'ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED';
export const CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING =
  'CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING';
export const ERROR_WHEN_UPDATE_STATUS_TO_COMPLETED_FOR_CHEF_ORDER =
  'ERROR_WHEN_UPDATE_STATUS_TO_COMPLETED_FOR_CHEF_ORDER';
export const START_DATE_CAN_NOT_BE_EMPTY = 'START_DATE_CAN_NOT_BE_EMPTY';
export const END_DATE_CAN_NOT_BE_EMPTY = 'END_DATE_CAN_NOT_BE_EMPTY';
export const PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA =
  'PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA';
export const PRINTER_IP_EMPTY = 'PRINTER_IP_EMPTY';
export const PRINTER_PORT_EMPTY = 'PRINTER_PORT_EMPTY';
export const PRINTER_CONNECT_ERROR = 'PRINTER_CONNECT_ERROR';
export const PRINTER_WRITE_ERROR = 'PRINTER_WRITE_ERROR';
export const CHEF_ORDER_MUST_BE_ACCEPTED = 'CHEF_ORDER_MUST_BE_ACCEPTED';
export const ORDER_MUST_BE_PAID = 'ORDER_MUST_BE_PAID';
export const NOT_FOUND_ANY_PRINTER_FOR_CHEF_AREA =
  'NOT_FOUND_ANY_PRINTER_FOR_CHEF_AREA';
export const NOT_FOUND_ANY_AVAILABLE_PRINTER_FOR_CHEF_ORDER =
  'NOT_FOUND_ANY_AVAILABLE_PRINTER_FOR_CHEF_ORDER';
export type TChefOrderErrorCodeKey =
  | typeof ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA
  | typeof CHEF_ORDER_NOT_FOUND
  | typeof ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED
  | typeof CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING
  | typeof ERROR_WHEN_UPDATE_STATUS_TO_COMPLETED_FOR_CHEF_ORDER
  | typeof CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER
  | typeof START_DATE_CAN_NOT_BE_EMPTY
  | typeof END_DATE_CAN_NOT_BE_EMPTY
  | typeof PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA
  | typeof PRINTER_IP_EMPTY
  | typeof PRINTER_PORT_EMPTY
  | typeof PRINTER_CONNECT_ERROR
  | typeof PRINTER_WRITE_ERROR
  | typeof CHEF_ORDER_MUST_BE_ACCEPTED
  | typeof ORDER_MUST_BE_PAID
  | typeof NOT_FOUND_ANY_PRINTER_FOR_CHEF_AREA
  | typeof NOT_FOUND_ANY_AVAILABLE_PRINTER_FOR_CHEF_ORDER;

export type TChefOrderErrorCode = Record<
  TChefOrderErrorCodeKey,
  TErrorCodeValue
>;

// 154501 - 155000
const ChefOrderValidation: TChefOrderErrorCode = {
  ERROR_DATA_DUPLICATE_PRODUCT_AND_BRANCH_IN_PRODUCT_CHEF_AREA: createErrorCode(
    154501,
    'Error data duplicate product and branch in product chef area',
  ),
  CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER: createErrorCode(
    154502,
    'Chef orders already exist from this order',
  ),
  CHEF_ORDER_NOT_FOUND: createErrorCode(154503, 'Chef order not found'),
  ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED:
    createErrorCode(
      154504,
      'All chef order items COMPLETED to update chef order status COMPLETED',
    ),
  CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING: createErrorCode(
    154505,
    'Chef order status can not change to pending',
  ),
  ERROR_WHEN_UPDATE_STATUS_TO_COMPLETED_FOR_CHEF_ORDER: createErrorCode(
    154506,
    'Error when update status to COMPLETED for chef order ',
  ),
  START_DATE_CAN_NOT_BE_EMPTY: createErrorCode(
    154507,
    'Start date can not be empty',
  ),
  END_DATE_CAN_NOT_BE_EMPTY: createErrorCode(
    154508,
    'End date can not be empty',
  ),
  PRODUCT_NOT_BELONG_TO_ANY_CHEF_AREA: createErrorCode(
    154509,
    'Product not belong to any chef area',
  ),
  PRINTER_IP_EMPTY: createErrorCode(154510, 'Printer IP is empty'),
  PRINTER_PORT_EMPTY: createErrorCode(154511, 'Printer port is empty'),
  PRINTER_CONNECT_ERROR: createErrorCode(154512, 'Printer connect error'),
  PRINTER_WRITE_ERROR: createErrorCode(154513, 'Printer write error'),
  CHEF_ORDER_MUST_BE_ACCEPTED: createErrorCode(
    154514,
    'Chef order must be accepted',
  ),
  ORDER_MUST_BE_PAID: createErrorCode(154515, 'Order must be paid'),
  NOT_FOUND_ANY_PRINTER_FOR_CHEF_AREA: createErrorCode(
    154516,
    'Not found any printer for chef area',
  ),
  NOT_FOUND_ANY_AVAILABLE_PRINTER_FOR_CHEF_ORDER: createErrorCode(
    154517,
    'Not found any available printer for chef order',
  ),
};

export default ChefOrderValidation;
