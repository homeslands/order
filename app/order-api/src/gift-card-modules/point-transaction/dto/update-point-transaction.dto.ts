import { PartialType } from '@nestjs/swagger';
import { CreatePointTransactionDto } from './create-point-transaction.dto';

export class UpdatePointTransactionDto extends PartialType(
  CreatePointTransactionDto,
) {}
