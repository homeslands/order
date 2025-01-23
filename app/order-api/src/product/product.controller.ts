import {
  BadRequestException,
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
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Public } from 'src/auth/public.decorator';
import {
  CreateProductRequestDto,
  ProductResponseDto,
  UpdateProductRequestDto,
} from './product.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { RoleEnum } from 'src/role/role.enum';
import { HasRoles } from 'src/role/roles.decorator';
import { CustomFileInterceptor, CustomFilesInterceptor } from 'src/file/custom-interceptor';
import { FileException } from 'src/file/file.exception';
import FileValidation from 'src/file/file.validation';

@ApiTags('Product')
@Controller('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Export all products successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Export all products' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.Staff, RoleEnum.Chef)
  async exportAllProducts() {
    const result = await this.productService.exportAllProducts();

    return new StreamableFile(result.data, {
      disposition: 'attachment; filename="exportAllProducts.xlsx"',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  @Get('import-template')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get import products template successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Get import products template' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.Staff, RoleEnum.Chef)
  @Public()
  async getTemplateImportProducts() {
    const result = await this.productService.getTemplateImportProducts();

    return new StreamableFile(result.data, {
      disposition: 'attachment; filename="import-products-template.xlsx"',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Create a new product successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.Staff, RoleEnum.Chef)
  async createProduct(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateProductRequestDto,
  ) {
    const result = await this.productService.createProduct(requestData);
    return {
      message: 'Product have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductResponseDto>;
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All products have been retrieved successfully',
    type: ProductResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Get all products successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({
    name: 'catalog',
    required: false,
    description: 'Filter products by catalog',
    type: String,
  })
  async getAllProducts(
    @Query('catalog') catalog: string,
  ): Promise<AppResponseDto<ProductResponseDto[]>> {
    const result = await this.productService.getAllProducts(catalog);
    return {
      message: 'All products have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductResponseDto[]>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update product successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Update product successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the product to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.Chef, RoleEnum.Staff)
  async updateProduct(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateProductDto: UpdateProductRequestDto,
  ) {
    const result = await this.productService.updateProduct(
      slug,
      updateProductDto,
    );

    return {
      message: 'Product have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete product successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Delete product successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the product to be deleted',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin)
  async deleteProduct(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<string>> {
    const result = await this.productService.deleteProduct(slug);
    return {
      message: 'Product have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} product have been deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Patch(':slug/upload')
  @HttpCode(HttpStatus.OK)
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.Chef, RoleEnum.Staff)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })

  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Product image have been uploaded successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Upload product image' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(new CustomFileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    }
  }))
  async uploadProductImage(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.productService.uploadProductImage(slug, file);
    return {
      message: 'Product have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductResponseDto>;
  }

  @Patch(':slug/uploads')
  @HttpCode(HttpStatus.OK)
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.Chef, RoleEnum.Staff)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Product image have been uploaded successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Upload multi product images' })
  @ApiResponse({
    status: 200,
    description: 'Product image have been uploaded successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(new CustomFilesInterceptor('files', 20, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 20
    }
  }))
  async uploadMultiProductImages(
    @Param('slug') slug: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const result = await this.productService.uploadMultiProductImages(
      slug,
      files,
    );
    return {
      message: 'Product have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductResponseDto>;
  }

  @Delete(':slug/images/:name')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Product image retrieved successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete product image' })
  @ApiResponse({
    status: 200,
    description: 'Product image deleted successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the product to be deleted image',
    required: true,
    example: '',
  })
  @ApiParam({
    name: 'name',
    description: 'The name of the image to be deleted',
    required: true,
    example: '',
  })
  async deleteProductImage(
    @Param('slug') slug: string,
    @Param('name') name: string,
  ): Promise<AppResponseDto<string>> {
    const result = await this.productService.deleteProductImage(slug, name);
    return {
      message: 'Product image deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} records have been deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Get(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Get product' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getProduct(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<ProductResponseDto>> {
    const result = await this.productService.getProduct(slug);
    return {
      message: 'Product retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ProductResponseDto>;
  }

  @Post('multi')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Create many products successfully',
    type: ProductResponseDto,
  })
  @ApiOperation({ summary: 'Create many products' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.Staff, RoleEnum.Chef)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(new CustomFileInterceptor('file', {
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return callback(
          Object.assign(
            new FileException(FileValidation.MUST_EXCEL_FILE)
          )
        );
      }
      callback(null, true);
    },
  }))
  async createManyProducts(
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.productService.createManyProducts(file);

    if(result.errors) {
      return new StreamableFile(result.excelBuffer, {
        disposition: 'attachment; filename="errorsCreateManyProducts.xlsx"',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } else {
      return {
        message: 'Products have been created successfully',
        statusCode: HttpStatus.CREATED,
        timestamp: new Date().toISOString(),
        result: `${result.countCreated} products have been created successfully`,
      } as AppResponseDto<string>;
    }
  }
}
