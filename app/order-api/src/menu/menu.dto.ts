import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { INVALID_BRANCH_SLUG, INVALID_DAY } from './menu.validation';
import { Transform, Type } from 'class-transformer';
import { MenuItemResponseDto } from 'src/menu-item/menu-item.dto';

export class CreateMenuDto {
  @AutoMap()
  @ApiProperty({ description: 'The day of menu', example: '2024-12-20' })
  @IsNotEmpty({ message: INVALID_DAY })
  @Type(() => Date)
  date: Date;

  @AutoMap()
  @ApiProperty({ description: 'The name of catalog', example: '6c661e85' })
  @IsNotEmpty({ message: INVALID_BRANCH_SLUG })
  branchSlug: string;

  @AutoMap()
  @ApiProperty({
    description: 'Determine the menu template',
    default: false,
    type: Boolean,
  })
  @Type(() => Boolean)
  @IsOptional()
  isTemplate: boolean;
}

export class UpdateMenuDto extends CreateMenuDto {}

export class GetAllMenuQueryRequestDto {
  @AutoMap()
  @ApiProperty({ required: false })
  branch?: string;

  @AutoMap()
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @AutoMap()
  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  size: number = 10;

  @AutoMap()
  @ApiProperty({
    description: 'Is template menu',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Preserve `undefined`
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isTemplate: boolean;
}

export class GetMenuRequestDto {
  @AutoMap()
  @ApiProperty({ required: false })
  slug?: string;

  @AutoMap()
  @ApiProperty({ required: false, example: '2024-11-20' })
  @Type(() => Date)
  date?: Date;

  @AutoMap()
  @ApiProperty({ required: false })
  branch?: string;
}

export class MenuResponseDto {
  @AutoMap()
  @ApiProperty()
  date: string;

  @AutoMap(() => MenuItemResponseDto)
  menuItems: MenuItemResponseDto[];

  @AutoMap()
  @ApiProperty()
  dayIndex: number;

  @AutoMap()
  @ApiProperty()
  isTemplate: boolean;
}
