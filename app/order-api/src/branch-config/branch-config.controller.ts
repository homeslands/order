import { Controller, Delete, Get, Patch, Query } from '@nestjs/common';
import { BranchConfigService } from './branch-config.service';
import {
  BranchConfigResponseDto,
  CreateBranchConfigDto,
  DeleteBranchConfigDto,
  GetBranchConfigQueryDto,
  UpdateBranchConfigDto,
} from './branch-config.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import {
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Body,
  ValidationPipe,
} from '@nestjs/common';

@Controller('branch-config')
@ApiBearerAuth()
@ApiTags('Branch Config')
export class BranchConfigController {
  constructor(private readonly branchConfigService: BranchConfigService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Branch config key created successfully',
    type: BranchConfigResponseDto,
  })
  @ApiOperation({ summary: 'Create a new branch config' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createConfig(
    @Body(new ValidationPipe({ transform: true }))
    createBranchConfigDto: CreateBranchConfigDto,
  ) {
    const result = await this.branchConfigService.createBranchConfig(
      createBranchConfigDto,
    );
    return {
      message: 'Branch config have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchConfigResponseDto>;
  }

  @Get('branch/:branchSlug')
  @HttpCode(HttpStatus.OK)
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Branch config key retrieved successfully',
    type: BranchConfigResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Retrieve list of branch configs' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAllConfigs(@Param('branchSlug') branchSlug: string) {
    const result =
      await this.branchConfigService.findAllBranchConfigs(branchSlug);
    return {
      message: 'Branch config have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchConfigResponseDto[]>;
  }

  @Get('specific')
  @HttpCode(HttpStatus.OK)
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Branch config key retrieved successfully',
    type: BranchConfigResponseDto,
  })
  @ApiOperation({ summary: 'Retrieve single branch config' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOneConfig(
    @Query(new ValidationPipe({ transform: true }))
    query: GetBranchConfigQueryDto,
  ) {
    const result = await this.branchConfigService.findOne(query);
    return {
      message: 'Branch config have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchConfigResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Branch config updated successfully',
    type: BranchConfigResponseDto,
  })
  @ApiOperation({ summary: 'Branch config updated successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateConfig(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    updateBranchConfigDto: UpdateBranchConfigDto,
  ) {
    const result = await this.branchConfigService.update(
      slug,
      updateBranchConfigDto,
    );
    return {
      message: 'Branch config have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchConfigResponseDto>;
  }

  @Delete()
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Branch config deleted successfully',
    type: BranchConfigResponseDto,
  })
  @ApiOperation({ summary: 'Branch config deleted successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeConfig(
    @Body(new ValidationPipe({ transform: true }))
    requestData: DeleteBranchConfigDto,
  ) {
    const result = await this.branchConfigService.remove(requestData);
    return {
      message: 'Branch config have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchConfigResponseDto>;
  }
}
