import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ZALO_OA_CONNECTOR_CONFIG_NOT_FOUND =
  'ZALO_OA_CONNECTOR_CONFIG_NOT_FOUND';
export const INITIATE_SMS_VERIFY_ACCOUNT_FAIL =
  'INITIATE_SMS_VERIFY_ACCOUNT_FAIL';
export const ZALO_OA_CONNECTOR_CONFIG_ALREADY_EXISTS =
  'ZALO_OA_CONNECTOR_CONFIG_ALREADY_EXISTS';
export const ERROR_INITIATE_SMS_VERIFY_ACCOUNT =
  'ERROR_INITIATE_SMS_VERIFY_ACCOUNT';
export const ZALO_OA_API_URL_NOT_FOUND = 'ZALO_OA_API_URL_NOT_FOUND';
export const ZALO_OA_CONNECTOR_HISTORY_NOT_FOUND =
  'ZALO_OA_CONNECTOR_HISTORY_NOT_FOUND';

export type TZaloOaConnectorErrorCodeKey =
  | typeof ZALO_OA_CONNECTOR_CONFIG_NOT_FOUND
  | typeof INITIATE_SMS_VERIFY_ACCOUNT_FAIL
  | typeof ERROR_INITIATE_SMS_VERIFY_ACCOUNT
  | typeof ZALO_OA_CONNECTOR_CONFIG_ALREADY_EXISTS
  | typeof ZALO_OA_API_URL_NOT_FOUND
  | typeof ZALO_OA_CONNECTOR_HISTORY_NOT_FOUND;

export type TZaloOaConnectorErrorCode = Record<
  TZaloOaConnectorErrorCodeKey,
  TErrorCodeValue
>;

// Error range: 158701 - 158800
export const ZaloOaConnectorValidation: TZaloOaConnectorErrorCode = {
  ZALO_OA_CONNECTOR_CONFIG_NOT_FOUND: createErrorCode(
    158701,
    'Zalo OA connector config not found',
  ),
  INITIATE_SMS_VERIFY_ACCOUNT_FAIL: createErrorCode(
    158702,
    'Initiate SMS verify account fail',
  ),
  ZALO_OA_CONNECTOR_CONFIG_ALREADY_EXISTS: createErrorCode(
    158703,
    'Zalo OA connector config already exists',
  ),
  ERROR_INITIATE_SMS_VERIFY_ACCOUNT: createErrorCode(
    158704,
    'Error when initiate sms verify account',
  ),
  ZALO_OA_API_URL_NOT_FOUND: createErrorCode(
    158705,
    'Zalo OA API URL not found',
  ),
  ZALO_OA_CONNECTOR_HISTORY_NOT_FOUND: createErrorCode(
    158706,
    'Zalo OA connector history not found',
  ),
};
