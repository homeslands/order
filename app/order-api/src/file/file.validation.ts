import { createErrorCode, TErrorCodeValue } from 'src/app/app.validation';

export const FILE_NOT_FOUND = 'FILE_NOT_FOUND';
export const FILE_SIZE_EXCEEDS_LIMIT_ALLOWED =
  'FILE_SIZE_EXCEEDS_LIMIT_ALLOWED';
export const NUMBER_OF_FILES_EXCEED_LIMIT_ALLOWED =
  'NUMBER_OF_FILES_EXCEED_LIMIT_ALLOWED';
export const LIMIT_UNEXPECTED_FILE = 'LIMIT_UNEXPECTED_FILE';
export const LIMIT_PART_COUNT = 'LIMIT_PART_COUNT';
export const LIMIT_FIELD_KEY = 'LIMIT_FIELD_KEY';
export const LIMIT_FIELD_COUNT = 'LIMIT_FIELD_COUNT';
export const LIMIT_FIELD_VALUE = 'LIMIT_FIELD_VALUE';
export const MULTER_ERROR = 'MULTER_ERROR';
export const ERROR_WHEN_UPLOAD_FILE = 'ERROR_WHEN_UPLOAD_FILE';
export const MUST_EXCEL_FILE = 'MUST_EXCEL_FILE';
export const EXCEL_FILE_WRONG_HEADER = 'EXCEL_FILE_WRONG_HEADER';

export type TFileErrorCodeKey =
  | typeof FILE_NOT_FOUND
  | typeof FILE_SIZE_EXCEEDS_LIMIT_ALLOWED
  | typeof NUMBER_OF_FILES_EXCEED_LIMIT_ALLOWED
  | typeof LIMIT_UNEXPECTED_FILE
  | typeof LIMIT_PART_COUNT
  | typeof LIMIT_FIELD_KEY
  | typeof LIMIT_FIELD_COUNT
  | typeof LIMIT_FIELD_VALUE
  | typeof ERROR_WHEN_UPLOAD_FILE
  | typeof MUST_EXCEL_FILE
  | typeof EXCEL_FILE_WRONG_HEADER
  | typeof MULTER_ERROR;

export type TFileErrorCode = Record<TFileErrorCodeKey, TErrorCodeValue>;

// 121000 - 122000
const FileValidation: TFileErrorCode = {
  FILE_NOT_FOUND: createErrorCode(121000, 'File not found'),
  FILE_SIZE_EXCEEDS_LIMIT_ALLOWED: createErrorCode(
    121001,
    'File size exceed limit allowed',
  ),
  NUMBER_OF_FILES_EXCEED_LIMIT_ALLOWED: createErrorCode(
    121002,
    'Number of files exceed limit allowed',
  ),
  LIMIT_UNEXPECTED_FILE: createErrorCode(121003, 'Limit unexpected file'),
  LIMIT_PART_COUNT: createErrorCode(121004, 'Limit part count'),
  LIMIT_FIELD_KEY: createErrorCode(121005, 'Limit field key'),
  LIMIT_FIELD_COUNT: createErrorCode(121006, 'Limit field count'),
  LIMIT_FIELD_VALUE: createErrorCode(121007, 'Limit field value'),
  MULTER_ERROR: createErrorCode(121008, 'Multer error'),
  ERROR_WHEN_UPLOAD_FILE: createErrorCode(121009, 'Error when upload file'),
  MUST_EXCEL_FILE: createErrorCode(121010, 'Must excel file'),
  EXCEL_FILE_WRONG_HEADER: createErrorCode(121011, 'Excel file wrong header'),
};

export default FileValidation;
