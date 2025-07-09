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
import { PromotionService } from './promotion.service';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreatePromotionRequestDto,
  PromotionResponseDto,
  UpdatePromotionRequestDto,
  GetAllPromotionRequestDto,
} from './promotion.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { AppResponseDto, AppPaginatedResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';

@ApiTags('Promotion')
@Controller('promotion')
@ApiBearerAuth()
export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  @Post(':branchSlug')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new promotion successfully',
    type: PromotionResponseDto,
  })
  @ApiOperation({ summary: 'Create new promotion' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation errors' })
  @ApiResponse({ status: 404, description: 'Not Found - Branch not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'branchSlug',
    description: 'The slug of the branch to create promotion for',
    required: true,
    example: 'branch-slug',
  })
  @Public()
  // @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
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
    const result = await this.promotionService.createPromotion(
      branchSlug,
      requestData,
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
    description: 'All promotions have been retrieved successfully',
    type: PromotionResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all promotions' })
  @ApiResponse({ status: 200, description: 'Get all promotions successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation errors' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Not Found - Branch not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @Public()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  async getAllPromotions(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: GetAllPromotionRequestDto,
  ): Promise<AppResponseDto<AppPaginatedResponseDto<PromotionResponseDto>>> {
    const result = await this.promotionService.getAllPromotions(query);
    return {
      message: 'All promotions have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<PromotionResponseDto>>;
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
  @ApiResponse({ status: 400, description: 'Bad Request - Validation errors or business logic errors' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Not Found - Promotion not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the promotion to be updated',
    required: true,
    example: 'summer-sale-promotion',
  })
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @Public()
  async updatePromotion(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        // transformOptions: { enableImplicitConversion: true }
      }),
    )
    updateProductDto: UpdatePromotionRequestDto,
  ) {
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
  @ApiOperation({ summary: 'Delete promotion' })
  @ApiResponse({ status: 200, description: 'Delete promotion successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Promotion already applied' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Not Found - Promotion not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the promotion to be deleted',
    required: true,
    example: 'summer-sale-promotion',
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
