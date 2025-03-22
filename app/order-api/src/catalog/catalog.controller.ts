import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  HttpStatus,
  HttpCode,
  Post,
  Body,
  Controller,
  ValidationPipe,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import {
  CreateCatalogRequestDto,
  CatalogResponseDto,
  UpdateCatalogRequestDto,
} from './catalog.dto';
import { CatalogService } from './catalog.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';

@ApiTags('Catalog')
@Controller('catalogs')
@ApiBearerAuth()
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Catalog created successfully',
    type: CatalogResponseDto,
  })
  @ApiOperation({ summary: 'Create a new catalog' })
  @ApiResponse({
    status: 200,
    description: 'Create a new catalog successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCatalog(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateCatalogRequestDto,
  ) {
    const result = await this.catalogService.createCatalog(requestData);
    return {
      message: 'Catalog have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CatalogResponseDto>;
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get all catalogs successfully',
    type: CatalogResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all catalogs' })
  @ApiResponse({ status: 200, description: 'Get all catalog successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllCatalogs() {
    const result = await this.catalogService.getAllCatalogs();
    return {
      message: 'Catalog have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CatalogResponseDto[]>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update catalog successfully',
    type: CatalogResponseDto,
  })
  @ApiOperation({ summary: 'Update catalog' })
  @ApiResponse({ status: 200, description: 'Update catalog successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the catalog to be updated',
    required: true,
    example: '',
  })
  async updateCatalog(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateCatalogDto: UpdateCatalogRequestDto,
  ) {
    const result = await this.catalogService.updateCatalog(
      slug,
      updateCatalogDto,
    );
    return {
      message: 'Catalog have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CatalogResponseDto>;
  }

  @Delete(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete catalog successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete catalog' })
  @ApiResponse({ status: 200, description: 'Delete catalog successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the catalog to be deleted',
    required: true,
    example: '',
  })
  async deleteCatalog(@Param('slug') slug: string) {
    const result = await this.catalogService.deleteCatalog(slug);
    return {
      message: 'Catalog have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} catalog have been deleted successfully`,
    } as AppResponseDto<string>;
  }
}
