import { Controller } from '@nestjs/common';
import { RecipientService } from './recipient.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('receipient')
@ApiTags('Receipient Resource')
@ApiBearerAuth()
export class ReceipientController {
  constructor(private readonly recipientService: RecipientService) {}
}
