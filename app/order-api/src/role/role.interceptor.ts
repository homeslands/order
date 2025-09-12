import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

// How to implement role based serialization?
// With a field in response dto, need to add @Expose decorator with groups parameter
// Example:
// @Expose({ groups: [RoleEnum.Admin] })
// name: string;
// => If user is admin, the field name will be serialized
// => If user is not admin, the field name will not be serialized
@Injectable()
export class RoleBasedSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const role = request.user?.scope?.role;

    return next.handle().pipe(
      map((data) => {
        // If data is StreamableFile or Buffer then return directly
        if (data instanceof StreamableFile || data instanceof Buffer) {
          return data;
        }

        // If data is not object or array then return directly
        if (typeof data !== 'object') {
          return data;
        }

        // Transform with plain object
        return plainToInstance(data?.constructor ?? Object, data, {
          groups: role ? [role] : [],
          // excludeExtraneousValues: true,
        });
      }),
    );
  }
}
