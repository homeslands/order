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
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { BranchService } from './branch.service';
import {
  BranchResponseDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './branch.dto';
import { Public } from 'src/auth/public.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@Controller('branch')
@ApiBearerAuth()
@ApiTags('Branch')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Post()
  // @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new branch' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new branch was created successfully',
    type: BranchResponseDto,
  })
  async createBranch(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreateBranchDto,
  ) {
    const result = await this.branchService.createBranch(requestData);
    return {
      message: 'The new branch was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchResponseDto>;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all branch' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All branchs have been retrieved successfully',
    type: BranchResponseDto,
    isArray: true,
  })
  @Public()
  async getAllBranchs() {
    const result = await this.branchService.getAllBranches();
    return {
      message: 'All branchs have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchResponseDto[]>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update branch' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Branch have been updated successfully',
    type: BranchResponseDto,
  })
  async updateBranch(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true })) requestData: UpdateBranchDto,
  ) {
    const result = await this.branchService.updateBranch(slug, requestData);
    return {
      message: 'Branch have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BranchResponseDto>;
  }

  @Delete(':slug')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete branch' })
  async deleteBranch(@Param('slug') slug: string) {
    await this.branchService.deleteBranch(slug);
    return {
      message: 'Branch have been deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<string>;
  }
}
