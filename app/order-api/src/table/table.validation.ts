import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const TABLE_NAME_EXIST = 'TABLE_NAME_EXIST';
export const TABLE_NOT_FOUND = 'TABLE_NOT_FOUND';
export const LOCATION_NOT_FOUND = 'LOCATION_NOT_FOUND';
export const LOCATION_ASSIGNED = 'LOCATION_ASSIGNED';
export const TABLE_DO_NOT_HAVE_LOCATION = 'TABLE_DO_NOT_HAVE_LOCATION';
export const CREATE_TABLE_FAILED = 'CREATE_TABLE_FAILED';
export const INVALID_TABLE_NAME = 'INVALID_TABLE_NAME';
export const UPDATE_TABLE_FAILED = 'UPDATE_TABLE_FAILED';
export const DELETE_TABLE_FAILED = 'DELETE_TABLE_FAILED';

export type TTableErrorCodeKey =
  | typeof TABLE_NAME_EXIST
  | typeof TABLE_NOT_FOUND
  | typeof LOCATION_ASSIGNED
  | typeof TABLE_DO_NOT_HAVE_LOCATION
  | typeof CREATE_TABLE_FAILED
  | typeof UPDATE_TABLE_FAILED
  | typeof INVALID_TABLE_NAME
  | typeof DELETE_TABLE_FAILED
  | typeof LOCATION_NOT_FOUND;

export type TTableErrorCode = Record<TTableErrorCodeKey, TErrorCodeValue>;

// 125000 - 126000
export const TableValidation: TTableErrorCode = {
  TABLE_NAME_EXIST: createErrorCode(125000, 'Table name already exists'),
  TABLE_NOT_FOUND: createErrorCode(125001, 'Table not found'),
  TABLE_DO_NOT_HAVE_LOCATION: createErrorCode(
    125002,
    'Table do not have location',
  ),
  LOCATION_NOT_FOUND: createErrorCode(125003, 'Location not found'),
  LOCATION_ASSIGNED: createErrorCode(125004, 'Location is already assigned'),
  CREATE_TABLE_FAILED: createErrorCode(125005, 'Create table failed'),
  INVALID_TABLE_NAME: createErrorCode(125006, 'Invalid table name'),
  UPDATE_TABLE_FAILED: createErrorCode(125007, 'Update table failed'),
  DELETE_TABLE_FAILED: createErrorCode(125008, 'Delete table failed'),
};
