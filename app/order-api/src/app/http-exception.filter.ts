import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as _ from 'lodash';
import { AppExceptionResponseDto } from './app.dto';
import { AppValidation } from './app.validation';
import { AuthValidation } from 'src/auth/auth.validation';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const exceptionResponse = exception.getResponse();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let statusCode = exception.getStatus();
    let code = statusCode;
    let message = exception.message;
    if (_.has(exception, '_errorCodeValue')) {
      code = _.get(exception, '_errorCodeValue.code');
      // message = _.get(exception, '_errorCodeValue.message');
    }

    if (
      typeof exceptionResponse === 'object' &&
      _.has(exceptionResponse, 'message')
    ) {
      const messages = exceptionResponse.message;
      message = Array.isArray(messages) ? messages[0] : messages; // Get the first error message if it's an array
    }

    const errorCode = AppValidation[message] || AuthValidation[message];
    if (errorCode) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      code = errorCode.code;
      message = errorCode.message;
    }

    const appResponseDto = {
      statusCode: code,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    } as AppExceptionResponseDto;
    response.status(statusCode).json(appResponseDto);
  }
}
