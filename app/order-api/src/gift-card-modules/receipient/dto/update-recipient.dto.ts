import { PartialType } from '@nestjs/swagger';
import { CreateRecipientDto } from './create-recipient.dto';

export class UpdateRecipientDto extends PartialType(CreateRecipientDto) {}
