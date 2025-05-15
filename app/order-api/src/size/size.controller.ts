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
  CreateSizeRequestDto,
  SizeResponseDto,
  UpdateSizeRequestDto,
} from './size.dto';
import { SizeService } from './size.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';

@ApiTags('Size')
@Controller('sizes')
@ApiBearerAuth()
export class SizeController {
  constructor(private sizeService: SizeService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new size successfully',
    type: SizeResponseDto,
  })
  @ApiOperation({ summary: 'Create a new size' })
  @ApiResponse({ status: 200, description: 'Create size successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createSize(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateSizeRequestDto,
  ) {
    const result = await this.sizeService.createSize(requestData);
    return {
      message: 'Size have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<SizeResponseDto>;
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Sizes retrieved successfully',
    type: SizeResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all sizes' })
  @ApiResponse({ status: 200, description: 'Get all sizes successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllSizes() {
    const result = await this.sizeService.getAllSizes();
    return {
      message: 'All sizes have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<SizeResponseDto[]>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update size successfully',
    type: SizeResponseDto,
  })
  @ApiOperation({ summary: 'Update size' })
  @ApiResponse({ status: 200, description: 'Update size successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the size to be updated',
    required: true,
    example: '',
  })
  async updateSize(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateSizeDto: UpdateSizeRequestDto,
  ) {
    const result = await this.sizeService.updateSize(slug, updateSizeDto);
    return {
      message: 'The size have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<SizeResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete size successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete size' })
  @ApiResponse({ status: 200, description: 'Delete size successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the size to be deleted',
    required: true,
    example: 'slug-123',
  })
  async deleteSize(@Param('slug') slug: string) {
    const result = await this.sizeService.deleteSize(slug);
    return {
      message: 'The size have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} size have been deleted successfully`,
    } as AppResponseDto<string>;
  }
}
