import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PointTransactionTypeEnum } from '../entities/point-transaction.enum';
import { INVALID_POINT_TRANSACTION_TYPE } from '../point-transaction.validation';

export class CreatePointTransactionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(PointTransactionTypeEnum, { message: INVALID_POINT_TRANSACTION_TYPE })
  type: PointTransactionTypeEnum;
}
