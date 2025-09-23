import { Controller, Get, Param, HttpCode } from '@nestjs/common';
import { GoogleMapService } from './google-map.service';
import {
  GetAddressDirectionDto,
  GetAddressDistanceAndDurationDto,
} from './dto/google-map.request.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import {
  DistanceAndDurationResponseDto,
  LocationResponseDto,
  RouteAndDirectionResponseDto,
  SuggestionAddressResultResponseDto,
} from './dto/google-map.response.dto';
import { HttpStatus } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Query } from '@nestjs/common';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('google-map')
@ApiBearerAuth()
@ApiTags('Google Map')
export class GoogleMapController {
  constructor(private readonly googleMapService: GoogleMapService) {}

  @Get('/address/suggestion/:name')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve address' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Address suggestion has been retrieved successfully',
    type: SuggestionAddressResultResponseDto,
    isArray: true,
  })
  async findAddress(@Param('name') name: string) {
    const result = await this.googleMapService.getAddressSuggestion(name);
    return {
      message: 'Address suggestion has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<SuggestionAddressResultResponseDto[]>;
  }

  @Get('/location/place/:placeId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve address by place id' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Address has been retrieved successfully',
    type: LocationResponseDto,
  })
  async findAddressByPlaceId(@Param('placeId') placeId: string) {
    const result = await this.googleMapService.getLocationByPlaceId(placeId);
    return {
      message: 'Address has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<LocationResponseDto>;
  }

  @Get('/direction')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get address direction' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Address direction has been retrieved successfully',
    type: RouteAndDirectionResponseDto,
  })
  async getAddressDirection(
    @Query(new ValidationPipe({ transform: true }))
    option: GetAddressDirectionDto,
  ) {
    const result = await this.googleMapService.getAddressDirection(option);
    return {
      message: 'Address direction has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<RouteAndDirectionResponseDto>;
  }

  @Get('/distance-and-duration')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get address distance and duration' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description:
      'Address distance and duration has been retrieved successfully',
    type: DistanceAndDurationResponseDto,
  })
  async getAddressDistanceAndDuration(
    @Query(new ValidationPipe({ transform: true }))
    option: GetAddressDistanceAndDurationDto,
  ) {
    const result = await this.googleMapService.getDistanceAndDuration(option);
    return {
      message: 'Address distance and duration has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<DistanceAndDurationResponseDto>;
  }
}
