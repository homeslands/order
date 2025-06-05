import { Controller } from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('gift-card')
@ApiTags('Gift Card Resource')
@ApiBearerAuth()
export class GiftCardController {
}
