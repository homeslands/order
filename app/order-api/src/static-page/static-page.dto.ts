import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import {
  STATIC_PAGE_CONTENT_INVALID,
  STATIC_PAGE_KEY_INVALID,
  STATIC_PAGE_TITLE_INVALID,
} from './static-page.validation';
import { BaseResponseDto } from 'src/app/base.dto';

export class CreateStaticPageDto {
  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: STATIC_PAGE_KEY_INVALID })
  key: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: STATIC_PAGE_TITLE_INVALID })
  title: string;

  @AutoMap()
  @ApiProperty()
  @IsOptional()
  content: string;
}

export class UpdateStaticPageDto {
  // @AutoMap()
  // @ApiProperty()
  // @IsNotEmpty({ message: STATIC_PAGE_KEY_INVALID })
  // key: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: STATIC_PAGE_TITLE_INVALID })
  title: string;

  @AutoMap()
  @ApiProperty()
  @IsNotEmpty({ message: STATIC_PAGE_CONTENT_INVALID })
  content: string;
}

export class StaticPageResponseDto extends BaseResponseDto {
  @AutoMap()
  key: string;

  @AutoMap()
  title: string;

  @AutoMap()
  content: string;
}
