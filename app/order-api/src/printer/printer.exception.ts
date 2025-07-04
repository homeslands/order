import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/app/app.exception';
import { TErrorCodeValue } from 'src/app/app.validation';

export class PrinterException extends AppException {
  constructor(
    errorCodeValue: TErrorCodeValue | HttpStatus,
    message?: string,
    statusCode?: number,
  ) {
    super(errorCodeValue, message, statusCode);
  }
}
