import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGiftCardDto {
  @IsNotEmpty()
  @IsString()
  cardOrderSlug: string;

  @IsNotEmpty()
  @IsString()
  cardSlug: string;
}
