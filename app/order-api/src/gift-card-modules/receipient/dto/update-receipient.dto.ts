import { PartialType } from '@nestjs/swagger';
import { CreateReceipientDto } from './create-receipient.dto';

export class UpdateReceipientDto extends PartialType(CreateReceipientDto) {}
