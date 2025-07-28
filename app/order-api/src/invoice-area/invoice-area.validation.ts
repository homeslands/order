import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const CREATE_INVOICE_AREA_ERROR = 'CREATE_INVOICE_AREA_ERROR';
export const INVOICE_AREA_NOT_FOUND = 'INVOICE_AREA_NOT_FOUND';

export type TInvoiceAreaErrorCodeKey =
  | typeof CREATE_INVOICE_AREA_ERROR
  | typeof INVOICE_AREA_NOT_FOUND;

// 158901 - 159000
export const InvoiceAreaValidation: Record<
  TInvoiceAreaErrorCodeKey,
  TErrorCodeValue
> = {
  CREATE_INVOICE_AREA_ERROR: createErrorCode(
    158901,
    'Error when creating invoice area',
  ),
  INVOICE_AREA_NOT_FOUND: createErrorCode(158902, 'Invoice area not found'),
};
