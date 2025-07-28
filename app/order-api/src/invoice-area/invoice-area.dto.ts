import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseResponseDto } from 'src/app/base.dto';
import { BranchResponseDto } from 'src/branch/branch.dto';

export class CreateInvoiceAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The slug of branch',
    example: 'branch-slug',
  })
  @IsNotEmpty({ message: 'Slug of branch is required' })
  branch: string;

  @AutoMap()
  @ApiProperty({
    description: 'The name of invoice area',
    example: 'Invoice Area',
  })
  @IsNotEmpty({ message: 'Name of invoice area is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of invoice area',
    example: 'Invoice area description',
  })
  @IsOptional()
  description?: string;
}

export class InvoiceAreaResponseDto extends BaseResponseDto {
  @AutoMap()
  @ApiProperty({
    description: 'The name of invoice area',
    example: 'Invoice Area',
  })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of invoice area',
    example: 'Invoice area description',
  })
  description?: string;

  @AutoMap()
  @ApiProperty({
    description: 'The branch of invoice area',
    example: 'Branch',
  })
  branch: BranchResponseDto;
}

export class UpdateInvoiceAreaRequestDto {
  @AutoMap()
  @ApiProperty({
    description: 'The name of invoice area',
    example: 'Invoice Area',
  })
  @IsNotEmpty({ message: 'Name of invoice area is required' })
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'The description of invoice area',
    example: 'Invoice area description',
  })
  @IsOptional()
  description?: string;
}
