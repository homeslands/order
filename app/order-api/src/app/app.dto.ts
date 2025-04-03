import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class AppResponseDto<T> {
  @ApiProperty()
  @AutoMap()
  statusCode: number;

  @ApiProperty()
  @AutoMap()
  timestamp: string;

  @ApiProperty()
  @AutoMap()
  method: string;

  @ApiProperty()
  @AutoMap()
  path: string;

  @ApiProperty()
  @AutoMap()
  result: T;

  @ApiProperty()
  @AutoMap()
  message: string;
}

export class AppPaginatedResponseDto<T> {
  @ApiProperty()
  @AutoMap()
  total: number;

  @ApiProperty()
  @AutoMap()
  page: number;

  @ApiProperty()
  @AutoMap()
  pageSize: number;

  @ApiProperty()
  @AutoMap()
  items: T[];

  @ApiProperty()
  @AutoMap()
  hasPrevios: boolean;

  @ApiProperty()
  @AutoMap()
  hasNext: boolean;

  @ApiProperty()
  @AutoMap()
  totalPages: number;
}

export class AppExceptionResponseDto extends AppResponseDto<void> {}
