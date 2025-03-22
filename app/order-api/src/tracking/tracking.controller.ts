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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  ChangeStatusRequestDto,
  CreateTrackingRequestDto,
  GetTrackingRequestDto,
  TrackingResponseDto,
} from './tracking.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';

@ApiTags('Tracking')
@Controller('trackings')
@ApiBearerAuth()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all trackings' })
  @ApiResponse({ status: 200, description: 'Get all trackings successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All trackings have been retrieved successfully',
    type: TrackingResponseDto,
    isArray: true,
  })
  async getAllTrackings(
    @Query(new ValidationPipe({ transform: true }))
    query: GetTrackingRequestDto,
  ) {
    const result = await this.trackingService.getAllTrackings(query);
    return {
      message: 'All orders have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<TrackingResponseDto>>;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new tracking successfully',
    type: TrackingResponseDto,
  })
  @ApiOperation({ summary: 'Create a new tracking' })
  @ApiResponse({ status: 200, description: 'Create tracking successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTracking(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateTrackingRequestDto,
  ) {
    const result =
      await this.trackingService.createTrackingAllCases(requestData);
    return {
      message: 'Tracking have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TrackingResponseDto>;
  }

  @Patch(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update tracking successfully',
    type: TrackingResponseDto,
  })
  @ApiOperation({ summary: 'Update tracking' })
  @ApiResponse({ status: 200, description: 'Update tracking successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the tracking to be updated',
    required: true,
    example: '',
  })
  async updateTracking(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateSizeDto: ChangeStatusRequestDto,
  ) {
    const result = await this.trackingService.changeStatus(
      slug,
      updateSizeDto.status,
    );
    return {
      message: 'The tracking have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TrackingResponseDto>;
  }

  @Delete(':slug')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Delete tracking successfully',
    type: TrackingResponseDto,
  })
  @ApiOperation({ summary: 'Delete tracking' })
  @ApiResponse({ status: 200, description: 'Delete tracking successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the tracking to be deleted',
    required: true,
    example: '',
  })
  async deleteTracking(@Param('slug') slug: string) {
    const result = await this.trackingService.delete(slug);
    return {
      message: 'The tracking have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} records has been deleted`,
    } as AppResponseDto<string>;
  }
}
