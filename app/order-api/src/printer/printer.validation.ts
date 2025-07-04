import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const PRINTER_NOT_FOUND = 'PRINTER_NOT_FOUND';
export const PRINTER_ALREADY_EXISTS = 'PRINTER_ALREADY_EXISTS';
export const UN_SUPPORTED_PRINTER_TYPE = 'UN_SUPPORTED_PRINTER_TYPE';
export const EOS_POST_SEND_ERROR = 'EOS_POST_SEND_ERROR';
export const ERROR_PRINTING_JOB = 'ERROR_PRINTING_JOB';
export const PRINTER_NOT_ACTIVE = 'PRINTER_NOT_ACTIVE';

export type TPrinterErrorCodeKey =
  | typeof PRINTER_NOT_FOUND
  | typeof PRINTER_ALREADY_EXISTS
  | typeof UN_SUPPORTED_PRINTER_TYPE
  | typeof EOS_POST_SEND_ERROR
  | typeof ERROR_PRINTING_JOB
  | typeof PRINTER_NOT_ACTIVE;

export type TPrinterErrorCode = Record<TPrinterErrorCodeKey, TErrorCodeValue>;

// 158601 - 158700
const PrinterValidation: TPrinterErrorCode = {
  PRINTER_NOT_FOUND: createErrorCode(158601, 'Printer not found'),
  PRINTER_ALREADY_EXISTS: createErrorCode(158602, 'Printer already exists'),
  UN_SUPPORTED_PRINTER_TYPE: createErrorCode(
    158603,
    'Unsupported printer type',
  ),
  EOS_POST_SEND_ERROR: createErrorCode(158604, 'ESC/POS send error'),
  ERROR_PRINTING_JOB: createErrorCode(158605, 'Error printing job'),
  PRINTER_NOT_ACTIVE: createErrorCode(158606, 'Printer not active'),
};

export default PrinterValidation;
