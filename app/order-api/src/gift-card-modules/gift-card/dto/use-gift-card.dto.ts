import { IsNotEmpty, IsString } from 'class-validator';

export class UseGiftCardDto {
  @IsNotEmpty()
  @IsString()
  serial: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  userSlug: string;
}
