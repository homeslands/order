import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ValidationPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BannerService } from './banner.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { BannerResponseDto, CreateBannerRequestDto, GetBannerQueryDto, UpdateBannerRequestDto } from './banner.dto';
import { Public } from 'src/auth/public.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { CustomFileInterceptor } from 'src/file/custom-interceptor';

@ApiTags('Banner')
@Controller('banner')
@ApiBearerAuth()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get all banners successfully',
    type: BannerResponseDto,
    isArray: true
  })
  @ApiOperation({ summary: 'Get all banners' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllBanners(
    @Query(new ValidationPipe({ transform: true }))
    query: GetBannerQueryDto
  ) {
    console.log({queryX: query})
    const result = await this.bannerService.getAllBanners(
      query
    );
    return {
      message: 'Get all banners successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BannerResponseDto[]>;
  }

  @Get(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get banner successfully',
    type: BannerResponseDto,
  })
  @ApiOperation({ summary: 'Get specific banner' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSpecificBanner(
    @Param('slug') slug: string,
  ) {
    const result = await this.bannerService.getSpecificBanner(
      slug
    );
    return {
      message: 'Get specific banner successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BannerResponseDto>;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Create a new product successfully',
    type: BannerResponseDto,
  })
  @ApiOperation({ summary: 'Create new banner' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async createBanner(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateBannerRequestDto,
  ) {
    const result = await this.bannerService.createBanner(requestData);
    return {
      message: 'Banner have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BannerResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update banner successfully',
    type: BannerResponseDto,
  })
  @ApiOperation({ summary: 'Update banner' })
  @ApiResponse({ status: 200, description: 'Update banner successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the banner to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async updateBanner(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateBannerDto: UpdateBannerRequestDto,
  ) {
    const result = await this.bannerService.updateBanner(
      slug,
      updateBannerDto,
    );

    return {
      message: 'Banner have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BannerResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete banner successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete banner' })
  @ApiResponse({ status: 200, description: 'Delete banner successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the banner to be deleted',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async deleteBanner(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<string>> {
    const result = await this.bannerService.deleteBanner(slug);
    return {
      message: 'Banner have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} banner have been deleted successfully`,
    } as AppResponseDto<string>;
  }
  

  @Patch(':slug/upload')
  // @Public()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
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
    description: 'Banner image have been uploaded successfully',
    type: BannerResponseDto,
  })
  @ApiOperation({ summary: 'Upload banner image' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseInterceptors(new CustomFileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    }
  }))
  async uploadBannerImage(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.bannerService.uploadImageBanner(slug, file);
    return {
      message: 'Banner image have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BannerResponseDto>;
  }
}
