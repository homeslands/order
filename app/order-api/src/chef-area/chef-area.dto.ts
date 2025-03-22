import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { BranchResponseDto } from 'src/branch/branch.dto';

export class CreateChefAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: 'branch-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of branch is required' })
  branch: string;

  @AutoMap()
  @ApiProperty({
    description: 'The name of chef area',
    example: 'Chef Area',
    required: true,
  })
  @IsNotEmpty({ message: 'Name of chef area is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of chef area',
    example: 'Chef area description',
    required: false,
  })
  @IsOptional()
  description?: string;
}

export class UpdateChefAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: 'branch-slug',
    required: true,
  })
  @IsNotEmpty({ message: 'The slug of branch is required' })
  branch: string;

  @AutoMap()
  @ApiProperty({
    description: 'The name of chef area',
    example: 'Chef Area',
    required: true,
  })
  @IsNotEmpty({ message: 'Name of chef area is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of chef area',
    example: 'Chef area description',
    required: false,
  })
  @IsOptional()
  description?: string;
}

export class ChefAreaResponseDto extends BaseResponseDto {
  @AutoMap()
  name: string;

  @AutoMap()
  description?: string;

  @AutoMap(() => BranchResponseDto)
  branch: BranchResponseDto;
}

export class QueryGetChefAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: 'branch-slug',
    required: false,
  })
  @IsOptional()
  branch?: string;
}
