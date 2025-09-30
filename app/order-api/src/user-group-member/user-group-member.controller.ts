import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  ValidationPipe,
  HttpCode,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserGroupMemberService } from './user-group-member.service';
import {
  AddUserToGroupDto,
  UserGroupMemberResponseDto,
  BulkAddUsersToGroupDto,
  GetUserGroupMemberQuery,
} from './user-group-member.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { CurrentUser } from 'src/user/user.decorator';
import { CurrentUserDto } from 'src/user/user.dto';

@ApiTags('User Group Members')
@ApiBearerAuth()
@Controller('user-group-member')
export class UserGroupMemberController {
  constructor(
    private readonly userGroupMemberService: UserGroupMemberService,
  ) {}

  @Post()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiOperation({ summary: 'Add user to group' })
  async addUserToGroup(
    @Body(new ValidationPipe({ transform: true }))
    addUserToGroupDto: AddUserToGroupDto,
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
  ): Promise<AppResponseDto<UserGroupMemberResponseDto>> {
    const result = await this.userGroupMemberService.addUserToGroup(
      addUserToGroupDto,
      user.userId,
    );
    return {
      message: 'User has been added to group successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserGroupMemberResponseDto>;
  }

  @Post('bulk')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @ApiOperation({ summary: 'Add multiple users to group at once' })
  async bulkAddUsersToGroup(
    @Body() bulkAddUsersDto: BulkAddUsersToGroupDto,
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
  ): Promise<AppResponseDto<string>> {
    await this.userGroupMemberService.bulkAddUsersToGroup(
      bulkAddUsersDto,
      user.userId,
    );
    return {
      message: 'Users have been added to group successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result: 'Users have been added to group successfully',
    } as AppResponseDto<string>;
  }

  @Get()
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all user group members' })
  @ApiResponse({
    status: 200,
    description: 'List of user group members',
    type: [UserGroupMemberResponseDto],
  })
  async findAll(
    @Query() params: GetUserGroupMemberQuery,
  ): Promise<
    AppResponseDto<AppPaginatedResponseDto<UserGroupMemberResponseDto>>
  > {
    const result = await this.userGroupMemberService.findAll(params);
    return {
      message: 'List of user group members',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<UserGroupMemberResponseDto>>;
  }

  @Get(':slug')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user group member by slug' })
  @ApiResponse({
    status: 200,
    description: 'User group member',
    type: UserGroupMemberResponseDto,
  })
  async findOne(
    @Param('slug') slug: string,
  ): Promise<AppResponseDto<UserGroupMemberResponseDto>> {
    const result = await this.userGroupMemberService.findOne(slug);
    return {
      message: 'User group member',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<UserGroupMemberResponseDto>;
  }

  @Delete(':slug')
  @HasRoles(RoleEnum.Manager, RoleEnum.Admin, RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user group member by slug' })
  @ApiResponse({
    status: 200,
    description: 'User group member',
    type: UserGroupMemberResponseDto,
  })
  async delete(@Param('slug') slug: string): Promise<AppResponseDto<void>> {
    await this.userGroupMemberService.removeUserFromGroup(slug);
    return {
      message: 'User group member',
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
