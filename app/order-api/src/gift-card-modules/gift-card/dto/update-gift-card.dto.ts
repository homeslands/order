import { PartialType } from '@nestjs/swagger';
import { CreateGiftCardDto } from './create-gift-card.dto';

export class UpdateGiftCardDto extends PartialType(CreateGiftCardDto) {}
