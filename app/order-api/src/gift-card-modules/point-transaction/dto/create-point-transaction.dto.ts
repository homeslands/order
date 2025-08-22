import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  PointTransactionObjectTypeEnum,
  PointTransactionTypeEnum,
} from '../entities/point-transaction.enum';
import {
  INVALID_POINT_TRANSACTION_MIN_VALUE,
  INVALID_POINT_TRANSACTION_OBJECT_TYPE,
  INVALID_POINT_TRANSACTION_TYPE,
} from '../point-transaction.validation';
import { AutoMap } from '@automapper/classes';

export class CreatePointTransactionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  @IsEnum(PointTransactionTypeEnum, { message: INVALID_POINT_TRANSACTION_TYPE })
  type: PointTransactionTypeEnum;

  @IsOptional()
  @ApiProperty()
  @AutoMap()
  desc: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  @IsEnum(PointTransactionObjectTypeEnum, {
    message: INVALID_POINT_TRANSACTION_OBJECT_TYPE,
  })
  objectType: PointTransactionObjectTypeEnum;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @AutoMap()
  objectSlug: string;

  @AutoMap()
  @ApiProperty()
  @Min(0, { message: INVALID_POINT_TRANSACTION_MIN_VALUE })
  points: number;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  userSlug: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  balance: number;
}
