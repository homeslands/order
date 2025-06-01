import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindByFieldDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The slug of the balance',
    required: false,
  })
  slug: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The slug of the user',
    required: false,
  })
  userSlug: string;
}
