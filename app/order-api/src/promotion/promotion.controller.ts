import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, ValidationPipe } from "@nestjs/common";
import { PromotionService } from "./promotion.service";
import { ApiResponseWithType } from "src/app/app.decorator";
import { CreatePromotionRequestDto, PromotionResponseDto, UpdatePromotionRequestDto } from "./promotion.dto";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HasRoles } from "src/role/roles.decorator";
import { RoleEnum } from "src/role/role.enum";
import { AppResponseDto } from "src/app/app.dto";
import { Public } from "src/auth/public.decorator";

@ApiTags('Promotion')
@Controller('promotion')
@ApiBearerAuth()
export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  @Post(':branchSlug')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Create a new promotion successfully',
    type: PromotionResponseDto,
  })
  @ApiOperation({ summary: 'Create new promotion' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
      name: 'branchSlug',
      description: 'The slug of the branch to be created promotion',
      required: true,
      example: 'branch-slug',
    })
  // @Public()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async createPromotion(
    @Param('branchSlug') branchSlug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreatePromotionRequestDto,
  ) {
    console.log('branchSlug', branchSlug);
    const result = await this.promotionService.createPromotion(
      branchSlug,
      requestData
    );
    return {
      message: 'Promotion have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PromotionResponseDto>;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get all promotions successfully',
    type: PromotionResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all promotions' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @Public()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async getAllPromotions(
    @Query('branchSlug') branchSlug: string,
  ) {
    console.log('branchSlug', branchSlug);
    const result = await this.promotionService.getAllPromotions(
      branchSlug,
    );
    return {
      message: 'All promotions have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PromotionResponseDto[]>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update promotion successfully',
    type: PromotionResponseDto,
  })
  @ApiOperation({ summary: 'Update promotion' })
  @ApiResponse({ status: 200, description: 'Update promotion successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the promotion to be updated',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async updatePromotion(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateProductDto: UpdatePromotionRequestDto,
  ) {
    console.log('slug', slug);
    const result = await this.promotionService.updatePromotion(
      slug,
      updateProductDto,
    );

    return {
      message: 'Promotion have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PromotionResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete promotion successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Delete promotion successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the promotion to be deleted',
    required: true,
    example: '',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async deleteProduct(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<string>> {
    const result = await this.promotionService.deletePromotion(slug);
    return {
      message: 'Promotion have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} promotion have been deleted successfully`,
    } as AppResponseDto<string>;
  }
}