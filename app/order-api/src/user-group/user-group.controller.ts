import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UserGroupService } from './user-group.service';
import {
  CreateUserGroupDto,
  UpdateUserGroupDto,
  GetAllUserGroupQueryRequestDto,
  UserGroupResponseDto,
} from './user-group.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { CurrentUser } from 'src/user/user.decorator';
import { CurrentUserDto } from 'src/user/user.dto';
import { AppResponseDto, AppPaginatedResponseDto } from 'src/app/app.dto';
import { ApiPaginatedResponse } from 'src/app/app.decorator';

@ApiTags('User Groups')
@ApiBearerAuth()
@Controller('user-group')
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiOperation({ summary: 'Create user group' })
  async create(
    @Body() createUserGroupDto: CreateUserGroupDto,
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
  ): Promise<AppResponseDto<UserGroupResponseDto>> {
    const result = await this.userGroupService.create(
      createUserGroupDto,
      user.userId,
    );
    return {
      message: 'User group created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserGroupResponseDto>;
  }

  @Get()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all user groups' })
  @ApiPaginatedResponse({
    status: 200,
    description: 'All user groups have been retrieved successfully',
    type: UserGroupResponseDto,
  })
  async getAllUserGroups(
    @Query(new ValidationPipe({ transform: true }))
    query: GetAllUserGroupQueryRequestDto,
  ): Promise<AppResponseDto<AppPaginatedResponseDto<UserGroupResponseDto>>> {
    const result = await this.userGroupService.getAllUserGroups(query);
    return {
      message: 'All user groups have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<UserGroupResponseDto>>;
  }

  // @Get('statistics')
  // @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  // @ApiOperation({ summary: 'Lấy thống kê nhóm người dùng' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Thống kê nhóm người dùng',
  // })
  // async getStatistics(): Promise<{
  //   totalGroups: number;
  //   activeGroups: number;
  //   inactiveGroups: number;
  // }> {
  //   return this.userGroupService.getStatistics();
  // }

  @Get(':slug')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an user group by slug' })
  async findOne(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<UserGroupResponseDto>> {
    const result = await this.userGroupService.findOne(slug);
    return {
      message: 'The user group retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserGroupResponseDto>;
  }

  @Patch(':slug')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiOperation({ summary: 'Update user group information' })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    updateUserGroupDto: UpdateUserGroupDto,
  ): Promise<AppResponseDto<UserGroupResponseDto>> {
    const result = await this.userGroupService.update(slug, updateUserGroupDto);
    return {
      message: 'The user group updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserGroupResponseDto>;
  }

  @Delete(':slug')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an user group by slug' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The user group has been deleted successfully',
  })
  async remove(@Param('slug') slug: string): Promise<AppResponseDto<void>> {
    await this.userGroupService.remove(slug);
    return {
      message: 'The user group has been deleted successfully',
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
