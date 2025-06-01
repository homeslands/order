import { PartialType } from '@nestjs/swagger';
import { CreateCardOrderDto } from './create-card-order.dto';

export class UpdateCardOrderDto extends PartialType(CreateCardOrderDto) {}
