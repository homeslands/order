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
import { ProductChefAreaService } from './product-chef-area.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreateManyProductChefAreasRequestDto,
  CreateProductChefAreaRequestDto,
  ProductChefAreaResponseDto,
  QueryGetProductChefAreaRequestDto,
} from './product-chef-area.dto';
import { AppResponseDto } from 'src/app/app.dto';

@Controller('product-chef-area')
@ApiBearerAuth()
@ApiTags('Product Chef Area')
export class ProductChefAreaController {
  constructor(
    private readonly productChefAreaService: ProductChefAreaService,
  ) {}

  @Post()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  // @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new product chef area' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new product chef area was created successfully',
    type: ProductChefAreaResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreateProductChefAreaRequestDto,
  ) {
    const result = await this.productChefAreaService.create(requestData);
    return {
      message: 'The new product chef area was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductChefAreaResponseDto>;
  }

  @Post('multi')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  // @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create many product chef area' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Many product chef area was created successfully',
    type: ProductChefAreaResponseDto,
    isArray: true,
  })
  async createMany(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreateManyProductChefAreasRequestDto,
  ) {
    const result = await this.productChefAreaService.createMany(requestData);
    return {
      message: 'Many product chef area was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductChefAreaResponseDto[]>;
  }

  @Get()
  // @Public()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all product chef areas' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Retrieve all product chef areas',
    type: ProductChefAreaResponseDto,
    isArray: true,
  })
  async getAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: QueryGetProductChefAreaRequestDto,
  ) {
    const result = await this.productChefAreaService.getAll(query);
    return {
      message: 'Retrieve all product chef areas',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductChefAreaResponseDto[]>;
  }

  @Get('specific/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve specific product chef areas' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Specific product chef area have been retrieved successfully',
    type: ProductChefAreaResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieved product chef area successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the product chef area to be retrieved',
    required: true,
    example: '',
  })
  // @Public()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async getSpecific(@Param('slug') slug: string) {
    const result = await this.productChefAreaService.getSpecific(slug);
    return {
      message: 'Specific product chef area have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductChefAreaResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The product chef area was updated successfully',
    type: ProductChefAreaResponseDto,
  })
  @ApiOperation({ summary: 'Update product chef area' })
  @ApiResponse({
    status: 200,
    description: 'Update product chef area successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the product chef area to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreateProductChefAreaRequestDto,
  ) {
    const result = await this.productChefAreaService.update(slug, requestData);
    return {
      message: 'The product chef area was updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductChefAreaResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The product chef area was deleted successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete product chef area' })
  @ApiResponse({
    status: 200,
    description: 'Delete product chef area successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the product chef area to be deleted',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async delete(@Param('slug') slug: string): Promise<AppResponseDto<string>> {
    const result = await this.productChefAreaService.delete(slug);
    return {
      message: 'The product chef area was deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} product chef area(s) deleted`,
    } as AppResponseDto<string>;
  }
}
