import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApplicablePromotionService } from './applicable-promotion.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  ApplicablePromotionResponseDto,
  CreateApplicablePromotionRequestDto,
  CreateManyApplicablePromotionsRequestDto,
} from './applicable-promotion.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@ApiTags('ApplicablePromotion')
@Controller('applicable-promotion')
@ApiBearerAuth()
export class ApplicablePromotionController {
  constructor(
    private readonly applicablePromotionService: ApplicablePromotionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Create a new applicable promotion successfully',
    type: ApplicablePromotionResponseDto,
  })
  @ApiOperation({ summary: 'Create new applicable promotion' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @Public()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Manager, RoleEnum.Admin)
  async createApplicablePromotion(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateApplicablePromotionRequestDto,
  ) {
    const result =
      await this.applicablePromotionService.createApplicablePromotion(
        requestData,
      );
    return {
      message: 'Applicable promotion have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ApplicablePromotionResponseDto>;
  }

  @Post('multi')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Create many applicable promotions successfully',
    type: ApplicablePromotionResponseDto,
  })
  @ApiOperation({ summary: 'Create many applicable promotions' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // @Public()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Manager, RoleEnum.Admin)
  async createManyApplicablePromotion(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateManyApplicablePromotionsRequestDto,
  ) {
    const result =
      await this.applicablePromotionService.createManyApplicablePromotions(
        requestData,
      );
    return {
      message: `${result.length} applicable promotions have been created successfully`,
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ApplicablePromotionResponseDto[]>;
  }

  @Delete(':slug')
  // @Public()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete applicable promotion' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Applicable promotion have been deleted successfully',
    type: String,
  })
  async deleteApplicablePromotion(@Param('slug') slug: string) {
    const result =
      await this.applicablePromotionService.deleteApplicablePromotion(slug);
    return {
      message: 'Applicable promotion have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} records have been deleted successfully`,
    } as AppResponseDto<string>;
  }
}
