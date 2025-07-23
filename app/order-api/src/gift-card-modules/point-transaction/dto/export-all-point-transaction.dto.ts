import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExportAllPointTransactionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  userSlug: string;
}
