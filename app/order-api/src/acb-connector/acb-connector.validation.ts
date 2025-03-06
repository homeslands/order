import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ACB_CONNECTOR_CONFIG_NOT_FOUND = 'ACB_CONNECTOR_CONFIG_NOT_FOUND';
export const X_OWNER_NUMBER_INVALID = 'X_OWNER_NUMBER_INVALID';
export const X_OWNER_TYPE_INVALID = 'X_OWNER_TYPE_INVALID';
export const X_PROVIDER_ID_INVALID = 'X_PROVIDER_ID_INVALID';
export const BENEFICIARY_NAME_INVALID = 'BENEFICIARY_NAME_INVALID';
export const VIRTUAL_ACCOUNT_PREFIX_INVALID = 'VIRTUAL_ACCOUNT_PREFIX_INVALID';
export const X_SERVICE_INVALID = 'X_SERVICE_INVALID';
export const ACB_CONNECTOR_CONFIG_EXIST = 'ACB_CONNECTOR_CONFIG_EXIST';
export const GET_ACB_TOKEN_FAIL = 'GET_ACB_TOKEN_FAIL';
export const INITIATE_QR_CODE_FAIL = 'INITIATE_QR_CODE_FAIL';
export const ACB_CONNECTOR_CONFIG_UPDATE_FAILED =
  'ACB_CONNECTOR_CONFIG_UPDATE_FAILED';
export const ACB_CONNECTOR_CONFIG_CREATION_FAILED =
  'ACB_CONNECTOR_CONFIG_CREATION_FAILED';

export type TACBConnectorErrorCodeKey =
  | typeof ACB_CONNECTOR_CONFIG_NOT_FOUND
  | typeof X_OWNER_TYPE_INVALID
  | typeof X_PROVIDER_ID_INVALID
  | typeof BENEFICIARY_NAME_INVALID
  | typeof VIRTUAL_ACCOUNT_PREFIX_INVALID
  | typeof X_SERVICE_INVALID
  | typeof ACB_CONNECTOR_CONFIG_EXIST
  | typeof GET_ACB_TOKEN_FAIL
  | typeof INITIATE_QR_CODE_FAIL
  | typeof X_OWNER_NUMBER_INVALID
  | typeof ACB_CONNECTOR_CONFIG_CREATION_FAILED
  | typeof ACB_CONNECTOR_CONFIG_UPDATE_FAILED;

export type TTACBConnectorErrorCode = Record<
  TACBConnectorErrorCodeKey,
  TErrorCodeValue
>;

// Error range: 103000 - 104000
export const ACBConnectorValidation: TTACBConnectorErrorCode = {
  ACB_CONNECTOR_CONFIG_NOT_FOUND: createErrorCode(
    103000,
    'ACB connector config not found',
  ),
  X_OWNER_NUMBER_INVALID: createErrorCode(103001, 'X owner number invalid'),
  X_OWNER_TYPE_INVALID: createErrorCode(103002, 'X owner type invalid'),
  X_PROVIDER_ID_INVALID: createErrorCode(103003, 'X provider id invalid'),
  BENEFICIARY_NAME_INVALID: createErrorCode(103004, 'Beneficiary name invalid'),
  VIRTUAL_ACCOUNT_PREFIX_INVALID: createErrorCode(
    103005,
    'Virtual account prefix invalid',
  ),
  X_SERVICE_INVALID: createErrorCode(103006, 'X service invalid'),
  ACB_CONNECTOR_CONFIG_EXIST: createErrorCode(
    103007,
    'ACB Config already exists',
  ),
  GET_ACB_TOKEN_FAIL: createErrorCode(103008, 'Failed to get ACB token'),
  INITIATE_QR_CODE_FAIL: createErrorCode(103009, 'Failed to initiate qr code'),
  ACB_CONNECTOR_CONFIG_CREATION_FAILED: createErrorCode(
    103010,
    'Failed to create ACB Config',
  ),
  ACB_CONNECTOR_CONFIG_UPDATE_FAILED: createErrorCode(
    103011,
    'Failed to update ACB Config',
  ),
};
