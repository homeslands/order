import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VariantService } from './variant.service';
import { Public } from 'src/auth/decorator/public.decorator';
import {
  CreateVariantRequestDto,
  UpdateVariantRequestDto,
  VariantResponseDto,
} from './variant.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';

@ApiTags('Variant')
@Controller('variants')
@ApiBearerAuth()
export class VariantController {
  constructor(private variantService: VariantService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new variant successfully',
    type: VariantResponseDto,
  })
  @ApiOperation({ summary: 'Create new variant' })
  @ApiResponse({ status: 200, description: 'Create new variant successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createVariant(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateVariantRequestDto,
  ) {
    const result = await this.variantService.createVariant(requestData);
    return {
      message: 'The variant have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VariantResponseDto>;
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All variants have been retrieved successfully',
    type: VariantResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all variants' })
  @ApiResponse({ status: 200, description: 'Get all variants successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({
    name: 'product',
    required: false,
    description: 'Filter variants by catalog',
    type: String,
  })
  async getAllVariants(@Query('product') product: string) {
    const result = await this.variantService.getAllVariants(product);
    return {
      message: 'All variants have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VariantResponseDto[]>;
  }

  @Patch(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Variants have been update successfully',
    type: VariantResponseDto,
  })
  @ApiOperation({ summary: 'Update variant' })
  @ApiResponse({ status: 200, description: 'Update variant successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the variant to be updated',
    required: true,
    example: '',
  })
  async updateVariant(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateVariantDto: UpdateVariantRequestDto,
  ) {
    const result = await this.variantService.updateVariant(
      slug,
      updateVariantDto,
    );
    return {
      message: 'The variant have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<VariantResponseDto>;
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':slug')
  @Public()
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete variant successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete variant' })
  @ApiResponse({ status: 200, description: 'Delete variant successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the variant to be deleted',
    required: true,
    example: '',
  })
  async deleteVariant(@Param('slug') slug: string) {
    const result = await this.variantService.deleteVariant(slug);
    return {
      message: 'The variant have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} variant have been deleted successfully`,
    } as AppResponseDto<string>;
  }
}
