import { PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './create-card.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {}
