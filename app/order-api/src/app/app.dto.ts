import { ApiProperty } from '@nestjs/swagger';

export class AppResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  result: T;

  @ApiProperty()
  message: string;
}

export class AppPaginatedResponseDto<T> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  items: T[];

  @ApiProperty()
  hasPrevios: boolean;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  totalPages: number;
}

export class AppExceptionResponseDto extends AppResponseDto<void> {}
