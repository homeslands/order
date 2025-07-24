import {
  Controller,
  Get,
  Body,
  Patch,
  HttpStatus,
  HttpCode,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { FeatureFlagResponseDto } from './dto/feature-flag-response.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { QueryFeatureFlagDto } from './dto/query-feature-flag.dto';
import { BulkUpdateFeatureFlagDto } from './dto/bulk-update-feature-flag.dto';
import { FeatureGroupResponseDto } from './dto/feature-group-response.dto';

@Controller('feature-flag')
@ApiTags('Feature Flag Resource')
@ApiBearerAuth()
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) { }

  @Get()
  @ApiOperation({ summary: 'Get all feature flags' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: FeatureFlagResponseDto,
  })
  async query(
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    req: QueryFeatureFlagDto,
  ) {
    const result = await this.featureFlagService.query(req);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<FeatureFlagResponseDto[]>;
  }

  @Get('group')
  @ApiOperation({ summary: 'Get grouped feature flags' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: FeatureFlagResponseDto,
  })
  async getGroup() {
    const result = await this.featureFlagService.getGroup();
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<FeatureGroupResponseDto[]>;
  }

  @Patch('bulk-toggle')
  @ApiOperation({ summary: 'Update multiple feature flags' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkToggle(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: BulkUpdateFeatureFlagDto,
  ) {
    await this.featureFlagService.bulkToggle(body);
  }
}
