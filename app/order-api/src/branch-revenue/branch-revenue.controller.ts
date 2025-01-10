import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BranchRevenueService } from './branch-revenue.service';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  AggregateBranchRevenueResponseDto,
  BranchRevenueResponseDto,
  GetBranchRevenueQueryDto,
} from './branch-revenue.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('revenue/branch')
@ApiTags('Branch Revenue')
@ApiBearerAuth()
export class BranchRevenueController {
  constructor(private readonly branchRevenueService: BranchRevenueService) {}

  @Get(':branch')
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiOperation({ summary: 'Get all branch revenues' })
  @ApiResponseWithType({
    type: AggregateBranchRevenueResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'The branch revenues retrieved successfully',
  })
  async findAll(
    @Param('branch') branch: string,
    @Query(new ValidationPipe({ transform: true }))
    query: GetBranchRevenueQueryDto,
  ) {
    const result = await this.branchRevenueService.findAll(branch, query);
    return {
      message: 'The branch revenues have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AggregateBranchRevenueResponseDto[]>;
  }

  @Patch('latest')
  @HttpCode(HttpStatus.OK)
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update latest branch revenue successfully',
    type: String,
  })
  @ApiOperation({ summary: 'Update latest branch revenue' })
  @ApiResponse({ status: 200, description: 'Update latest branch revenue successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateLatestBranchRevenue() {
    const result = await this.branchRevenueService.updateLatestBranchRevenueInCurrentDate();
    return {
      message: 'Update latest branch revenue successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: 'Update latest branch revenue successfully',
    } as AppResponseDto<string>;
  }
}
