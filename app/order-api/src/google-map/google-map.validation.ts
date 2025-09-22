import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const ERROR_WHEN_GET_ADDRESS = 'ERROR_WHEN_GET_ADDRESS';
export const ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID =
  'ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID';
export const ERROR_WHEN_GET_ADDRESS_DIRECTION =
  'ERROR_WHEN_GET_ADDRESS_DIRECTION';

export type TGoogleMapErrorCodeKey =
  | typeof ERROR_WHEN_GET_ADDRESS
  | typeof ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID
  | typeof ERROR_WHEN_GET_ADDRESS_DIRECTION;

// 159101 - 159200
export type TGoogleMapErrorCode = Record<
  TGoogleMapErrorCodeKey,
  TErrorCodeValue
>;

export const GoogleMapValidation: TGoogleMapErrorCode = {
  ERROR_WHEN_GET_ADDRESS: createErrorCode(159101, 'Error when get address'),
  ERROR_WHEN_GET_ADDRESS_BY_PLACE_ID: createErrorCode(
    159102,
    'Error when get address by place id',
  ),
  ERROR_WHEN_GET_ADDRESS_DIRECTION: createErrorCode(
    159103,
    'Error when get address direction',
  ),
};
