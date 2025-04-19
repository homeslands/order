import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { INVALID_DATE } from './menu.validation';
import { Transform, Type } from 'class-transformer';
import { MenuItemResponseDto } from 'src/menu-item/menu-item.dto';
import { INVALID_BRANCH_SLUG } from 'src/branch/branch.validation';
import { BaseQueryDto } from 'src/app/base.dto';
import { BranchResponseDto } from 'src/branch/branch.dto';

export class CreateMenuDto {
  @AutoMap()
  @ApiProperty({ description: 'The day of menu', example: '2024-12-20' })
  @IsNotEmpty({ message: INVALID_DATE })
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

export class GetAllMenuQueryRequestDto extends BaseQueryDto {
  @AutoMap()
  @ApiProperty({ required: false, description: 'The branch slug' })
  @IsOptional()
  branch?: string;

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
  @IsOptional()
  slug?: string;

  @AutoMap()
  @ApiProperty({ example: '2024-11-20' })
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  branch?: string;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  productName?: string;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  catalog?: string;

  @AutoMap()
  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  minPrice?: number;

  @AutoMap()
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  maxPrice?: number;

  @AutoMap()
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Preserve `undefined`
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  promotion?: boolean;

  @AutoMap()
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Preserve `undefined`
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isNewProduct?: boolean;

  @AutoMap()
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined; // Preserve `undefined`
    return value === 'true'; // Transform 'true' to `true` and others to `false`
  })
  isSortTopSell?: boolean;
}

export class MenuResponseDto {
  @AutoMap()
  @ApiProperty()
  date: string;

  @AutoMap(() => MenuItemResponseDto)
  @ApiProperty()
  menuItems: MenuItemResponseDto[];

  @AutoMap()
  @ApiProperty()
  dayIndex: number;

  @AutoMap()
  @ApiProperty()
  isTemplate: boolean;

  @AutoMap(() => BranchResponseDto)
  @ApiProperty()
  branch: BranchResponseDto;
}
