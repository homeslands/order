import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { AppPaginatedResponseDto, AppResponseDto } from './app.dto';

export interface IApiResponseOptions<TModel> {
  type: TModel;
  description?: string;
  status?: HttpStatus;
}

/**
 * Custom decorator that allows you to dynamically specify the type, status and description for a response
 * @param options: IApiResponseOptions<TModel>
 * @returns The decorator
 */
export function ApiResponseWithType<TModel extends Type<any>>({
  type,
  description,
  status = HttpStatus.OK,
  isArray = false,
}: IApiResponseOptions<TModel> & { isArray?: boolean }) {
  const isPrimitive = [String, Number, Boolean].includes(type as any);
  const getTypeSchema = (targetType: Type<any>) => {
    if (isPrimitive) {
      // For primitive types like string, number, boolean, use their string representation
      return { type: targetType.name.toLowerCase() };
    } else if (targetType === Date) {
      // For Date, treat as string in OpenAPI
      return { type: 'string', format: 'date-time' };
    } else {
      // For complex types, resolve via schema path
      return { $ref: getSchemaPath(targetType) };
    }
  };

  return applyDecorators(
    ApiExtraModels(AppResponseDto, type),
    ApiResponse({
      status: status,
      description: description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(AppResponseDto) },
          {
            properties: {
              result: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(type) }, // Each item in the array will follow the model type
                  }
                : getTypeSchema(type),
            },
          },
        ],
      },
    }),
  );
}

/**
 * This decorator is used to define a paginated response, where the 'result' field contains an array of models and
 * pagination information is provided along with a custom description.
 *
 * @param options: IApiResponseOptions<TModel>
 * @returns The decorator
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>({
  status = HttpStatus.OK,
  description,
  type,
}: IApiResponseOptions<TModel>) => {
  return applyDecorators(
    ApiExtraModels(AppPaginatedResponseDto, type),
    ApiResponse({
      status: status,
      description: description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(AppPaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
            },
          },
        ],
      },
    }),
  );
};
