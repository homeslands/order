import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { FeatureFlagSystemService } from './feature-flag-system.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  BulkUpdateChildFeatureFlagSystemRequestDto,
  BulkUpdateFeatureFlagSystemRequestDto,
  FeatureFlagSystemResponseDto,
  FeatureSystemGroupResponseDto,
} from './feature-flag-system.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiResponseWithType } from 'src/app/app.decorator';

@Controller('feature-flag-system')
@ApiTags('Feature Flag System')
@ApiBearerAuth()
export class FeatureFlagSystemController {
  constructor(
    private readonly featureFlagSystemService: FeatureFlagSystemService,
  ) {}

  @Patch('bulk-toggle')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiResponseWithType({
    status: HttpStatus.NO_CONTENT,
    description: 'Create a new order successfully',
    type: BulkUpdateFeatureFlagSystemRequestDto,
  })
  @ApiOperation({ summary: 'Update multiple feature flag system' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkToggle(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: BulkUpdateFeatureFlagSystemRequestDto,
  ) {
    await this.featureFlagSystemService.bulkToggleFlag(body);
    return {
      message: 'Feature flag system have been updated successfully',
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
      result: 'Feature flag system have been updated successfully',
    } as AppResponseDto<string>;
  }

  @Patch('child/bulk-toggle')
  @HasRoles(RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiResponseWithType({
    status: HttpStatus.NO_CONTENT,
    description: 'Create a new order successfully',
    type: BulkUpdateChildFeatureFlagSystemRequestDto,
  })
  @ApiOperation({ summary: 'Update multiple feature flag system' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkToggleChild(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: BulkUpdateChildFeatureFlagSystemRequestDto,
  ) {
    await this.featureFlagSystemService.bulkToggleChildFlag(body);
    return {
      message: 'Update child feature flag system successfully',
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
      result: 'Child feature flag system have been updated successfully',
    } as AppResponseDto<string>;
  }

  @Get('group')
  @Public()
  @ApiOperation({ summary: 'Get grouped feature flag system' })
  @HttpCode(HttpStatus.OK)
  async getGroup() {
    const result =
      await this.featureFlagSystemService.getAllFeaturesGroupSystem();
    return {
      message: 'Feature system group have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<FeatureSystemGroupResponseDto[]>;
  }

  @Get('group/:groupName')
  @Public()
  @ApiOperation({ summary: 'Get feature flag system by group' })
  @HttpCode(HttpStatus.OK)
  async getFlagSystemByGroup(@Param('groupName') groupName: string) {
    const result =
      await this.featureFlagSystemService.getAllFeaturesFlagSystem(groupName);
    return {
      message: 'Feature flag system have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<FeatureFlagSystemResponseDto[]>;
  }
}
