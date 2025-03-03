import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { StaticPageService } from './static-page.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator';
import {
  CreateStaticPageDto,
  StaticPageResponseDto,
  UpdateStaticPageDto,
} from './static-page.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { RoleEnum } from 'src/role/role.enum';
import { HasRoles } from 'src/role/roles.decorator';

@Controller('static-page')
@ApiBearerAuth()
@ApiTags('StaticPage')
export class StaticPageController {
  constructor(private readonly staticPageService: StaticPageService) {}

  @Post()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Static page created successfully',
    type: StaticPageResponseDto,
  })
  @ApiOperation({ summary: 'Create a new static page' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createStaticPageDto: CreateStaticPageDto,
  ) {
    const result = await this.staticPageService.create(createStaticPageDto);
    return {
      message: 'Static page have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<StaticPageResponseDto>;
  }

  @Get(':key')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Static page retrieved successfully',
    type: StaticPageResponseDto,
  })
  @ApiOperation({ summary: 'Retrieve a static page by key' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'key',
    type: 'string',
    required: true,
    example: 'about-us',
  })
  async getByKey(@Param('key') key: string) {
    const result = await this.staticPageService.getByKey(key);
    return {
      message: 'Static page have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<StaticPageResponseDto>;
  }

  @Get()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All static pages retrieved successfully',
    type: StaticPageResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Retrieve all static pages' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAll() {
    const result = await this.staticPageService.getAll();
    return {
      message: 'All static pages have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<StaticPageResponseDto[]>;
  }

  @Patch(':slug')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Static page updated successfully',
    type: StaticPageResponseDto,
  })
  @ApiOperation({ summary: 'Update a static page by slug' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    type: 'string',
    required: true,
    example: 'about-us-slug',
  })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateStaticPageDto: UpdateStaticPageDto,
  ) {
    const result = await this.staticPageService.update(
      slug,
      updateStaticPageDto,
    );
    return {
      message: 'Static page have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<StaticPageResponseDto>;
  }

  // @Delete(':slug')
  // @Public()
  // @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  // @HttpCode(HttpStatus.OK)
  // @ApiResponseWithType({
  //   status: HttpStatus.OK,
  //   description: 'Static page deleted successfully',
  //   type: String,
  // })
  // @ApiOperation({ summary: 'Delete a static page by slug' })
  // @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @ApiParam({
  //   name: 'slug',
  //   type: 'string',
  //   required: true,
  //   example: 'about-us-slug'
  // })
  // async remove(@Param('slug') slug: string) {
  //   const result = await this.staticPageService.remove(slug);
  //   return {
  //     message: 'Static page have been deleted successfully',
  //     statusCode: HttpStatus.OK,
  //     timestamp: new Date().toISOString(),
  //     result,
  //   } as AppResponseDto<StaticPageResponseDto>;
  // }
}
