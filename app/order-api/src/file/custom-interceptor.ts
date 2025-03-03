import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import multer from 'multer';
import { FileException } from './file.exception';
import FileValidation from './file.validation';

@Injectable()
export abstract class BaseFileInterceptor implements NestInterceptor {
  protected upload;

  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    return new Promise((resolve, reject) => {
      this.upload(req, req.res, (err) => {
        if (err) {
          if (err instanceof FileException) {
            if (err.errorCodeValue) {
              switch (err.errorCodeValue.code) {
                case 121010:
                  return reject(
                    new FileException(FileValidation.MUST_EXCEL_FILE),
                  );
              }
            }
          }

          if (err instanceof multer.MulterError) {
            switch (err.code) {
              case 'LIMIT_FILE_SIZE':
                return reject(
                  new FileException(
                    FileValidation.FILE_SIZE_EXCEEDS_LIMIT_ALLOWED,
                  ),
                );
              case 'LIMIT_UNEXPECTED_FILE':
                return reject(
                  new FileException(FileValidation.LIMIT_UNEXPECTED_FILE),
                );
              case 'LIMIT_PART_COUNT':
                return reject(
                  new FileException(FileValidation.LIMIT_PART_COUNT),
                );
              case 'LIMIT_FIELD_KEY':
                return reject(
                  new FileException(FileValidation.LIMIT_FIELD_KEY),
                );
              case 'LIMIT_FIELD_COUNT':
                return reject(
                  new FileException(FileValidation.LIMIT_FIELD_COUNT),
                );
              case 'LIMIT_FIELD_VALUE':
                return reject(
                  new FileException(FileValidation.LIMIT_FIELD_VALUE),
                );
              case 'LIMIT_FILE_COUNT':
                return reject(
                  new FileException(
                    FileValidation.NUMBER_OF_FILES_EXCEED_LIMIT_ALLOWED,
                  ),
                );
              default:
                return reject(new FileException(FileValidation.MULTER_ERROR));
            }
          }
          return reject(
            new FileException(FileValidation.ERROR_WHEN_UPLOAD_FILE),
          );
        }
        resolve(next.handle());
      });
    });
  }
}

@Injectable()
export class CustomFilesInterceptor extends BaseFileInterceptor {
  constructor(fieldName: string, maxCount: number, options?: multer.Options) {
    super();
    this.upload = multer(options).array(fieldName, maxCount);
  }
}

@Injectable()
export class CustomFileInterceptor extends BaseFileInterceptor {
  constructor(fieldName: string, options?: multer.Options) {
    super();
    this.upload = multer(options).single(fieldName);
  }
}
