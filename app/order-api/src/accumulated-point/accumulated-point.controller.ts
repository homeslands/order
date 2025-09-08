import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AccumulatedPointService } from './accumulated-point.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import {
  AccumulatedPointResponseDto,
  ApplyPointsRequestDto,
  ApplyPointsResponseDto,
  GetPointHistoryQueryDto,
  PointTransactionHistoryResponseDto,
} from './accumulated-point.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';

import { CurrentUser } from 'src/user/user.decorator';
import { CurrentUserDto } from 'src/user/user.dto';

@Controller('accumulated-point')
@ApiTags('Accumulated Points')
@ApiBearerAuth()
export class AccumulatedPointController {
  constructor(
    private readonly accumulatedPointService: AccumulatedPointService,
  ) {}

  @Get('user/:slug/points')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get total points of user' })
  @ApiParam({
    name: 'slug',
    description: 'Slug of user',
    required: true,
    example: 'user-slug-123',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get total points of user successfully',
    type: AccumulatedPointResponseDto,
  })
  async getTotalPoints(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<AccumulatedPointResponseDto>> {
    const result =
      await this.accumulatedPointService.getTotalPointsByUserSlug(slug);
    return {
      message: 'Get total points of user successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AccumulatedPointResponseDto>;
  }

  @Post('order/:slug/apply-points')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use accumulated points for order' })
  @ApiParam({
    name: 'slug',
    description: 'Slug of order',
    required: true,
    example: 'order-slug-123',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Use accumulated points for order successfully',
    type: ApplyPointsResponseDto,
  })
  async applyPoints(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: ApplyPointsRequestDto,
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
  ): Promise<AppResponseDto<ApplyPointsResponseDto>> {
    const result = await this.accumulatedPointService.reservePointsForOrder(
      slug,
      requestData.pointsToUse,
      user?.userId,
    );
    return {
      message: 'Use accumulated points for order successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ApplyPointsResponseDto>;
  }

  @Get('user/:slug/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get accumulated points history of user' })
  @ApiParam({
    name: 'slug',
    description: 'Slug of user',
    required: true,
    example: 'user-slug-123',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get accumulated points history of user successfully',
    type: PointTransactionHistoryResponseDto,
    isArray: true,
  })
  async getPointsHistory(
    @Param('slug') slug: string,
    @Query(new ValidationPipe({ transform: true }))
    query: GetPointHistoryQueryDto,
  ): Promise<
    AppResponseDto<AppPaginatedResponseDto<PointTransactionHistoryResponseDto>>
  > {
    const result = await this.accumulatedPointService.getPointsHistory(
      slug,
      query,
    );
    return {
      message: 'Get accumulated points history of user successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<
      AppPaginatedResponseDto<PointTransactionHistoryResponseDto>
    >;
  }
}
