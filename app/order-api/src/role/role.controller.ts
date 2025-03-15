import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { CreateRoleDto, RoleResponseDto, UpdateRoleDto } from './role.dto';
import { AppResponseDto } from 'src/app/app.dto';

@ApiTags('Role')
@Controller('role')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all roles' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All roles have been retrieved successfully',
    type: RoleResponseDto,
    isArray: true,
  })
  async findAll() {
    const result = await this.roleService.findAll();
    return {
      message: 'All roles have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<RoleResponseDto[]>;
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve role by slug' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Role has been retrieved successfully',
    type: RoleResponseDto,
  })
  async findOne(slug: string) {
    const result = await this.roleService.findOne(slug);
    return {
      message: 'Role has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<RoleResponseDto>;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create role' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Role has been created successfully',
    type: RoleResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createRoleDto: CreateRoleDto,
  ) {
    const result = await this.roleService.create(createRoleDto);
    return {
      message: 'Role has been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<RoleResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update role' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Role has been updated successfully',
    type: RoleResponseDto,
  })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateRoleDto: UpdateRoleDto,
  ) {
    const result = await this.roleService.update(slug, updateRoleDto);
    return {
      message: 'Role has been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<RoleResponseDto>;
  }

  // @Delete(':slug')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Delete role' })
  // @ApiResponseWithType({
  //   status: HttpStatus.OK,
  //   description: 'Role has been deleted successfully',
  //   type: RoleResponseDto,
  // })
  // async remove(@Param('slug') slug: string) {
  //   await this.roleService.remove(slug);
  //   return {
  //     message: 'Role has been deleted successfully',
  //     statusCode: HttpStatus.OK,
  //     timestamp: new Date().toISOString(),
  //   } as AppResponseDto<void>;
  // }
}
