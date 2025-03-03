import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { BaseResponseDto } from 'src/app/base.dto';

export class CreateSizeRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The name of size', example: 's' })
  @IsNotEmpty({ message: 'Size name is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of size',
    example: 'Capacity 400ml',
  })
  @IsOptional()
  description?: string;
}

export class UpdateSizeRequestDto {
  @AutoMap()
  @ApiProperty({ description: 'The name of size', example: 's' })
  @IsNotEmpty({ message: 'Size name is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of size',
    example: 'Capacity 400ml',
  })
  @IsOptional()
  description?: string;
}

export class SizeResponseDto extends BaseResponseDto {
  @ApiProperty()
  @AutoMap()
  name: string;

  @AutoMap()
  @ApiProperty()
  description?: string;
}
