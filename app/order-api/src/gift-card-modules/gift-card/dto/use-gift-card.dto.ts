import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UseGiftCardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  serial: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  userSlug: string;
}
