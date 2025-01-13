import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import {
  CreateUserRequestDto,
  GetAllUserQueryRequestDto,
  UpdateUserRequestDto,
  UpdateUserRoleRequestDto,
  UserResponseDto,
} from './user.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HasRoles(
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
    RoleEnum.Staff,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all user' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All users have been retrieved successfully',
    type: UserResponseDto,
    isArray: true,
  })
  async getAllUsers(
    @Query(new ValidationPipe({ transform: true }))
    query: GetAllUserQueryRequestDto,
  ): Promise<AppResponseDto<AppPaginatedResponseDto<UserResponseDto>>> {
    const result = await this.userService.getAllUsers(query);
    return {
      message: 'All users have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<UserResponseDto>>;
  }

  @Post()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'User has been created successfully',
    type: UserResponseDto,
  })
  async createUser(
    @Body(new ValidationPipe({ transform: true }))
    requestData: CreateUserRequestDto,
  ): Promise<AppResponseDto<UserResponseDto>> {
    const result = await this.userService.createUser(requestData);
    return {
      message: 'User has been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserResponseDto>;
  }

  @Post(':slug/reset-password')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset pwd' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'User password has been reset successfully',
    type: UserResponseDto,
  })
  async resetPassword(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<UserResponseDto>> {
    const result = await this.userService.resetPassword(slug);
    return {
      message: 'User password has been reset successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<UserResponseDto>;
  }

  @Post(':slug/role')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'User role have been updated successfully',
    type: UserResponseDto,
  })
  async updateUserRole(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: UpdateUserRoleRequestDto,
  ) {
    const result = await this.userService.updateUserRole(slug, requestData);
    return {
      message: 'User role has been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserResponseDto>;
  }

  @Patch(':slug')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'User info have been updated successfully',
    type: UserResponseDto,
  })
  async updateUser(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: UpdateUserRequestDto,
  ) {
    const result = await this.userService.updateUser(slug, requestData);
    return {
      message: 'User has been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserResponseDto>;
  }

  @Get(':slug')
  @HasRoles(RoleEnum.SuperAdmin, RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve user by slug' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'User has been retrieved successfully',
    type: UserResponseDto,
  })
  async getUserBySlug(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<UserResponseDto>> {
    const result = await this.userService.getUserBySlug(slug);
    return {
      message: 'User has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserResponseDto>;
  }
}
