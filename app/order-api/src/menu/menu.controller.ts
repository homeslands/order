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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateMenuDto,
  GetAllMenuQueryRequestDto,
  GetMenuRequestDto,
  MenuResponseDto,
  UpdateMenuDto,
} from './menu.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';

@ApiTags('Menu')
@Controller('menu')
@ApiBearerAuth()
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All menus have been retrieved successfully',
    type: MenuResponseDto,
    isArray: true,
  })
  async getAllMenus(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: GetAllMenuQueryRequestDto,
  ) {
    const result = await this.menuService.getAllMenus(query);
    return {
      message: 'All menus have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<MenuResponseDto>>;
  }

  @Get('specific')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve specific menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The specific menu was retrieved successfully',
    type: MenuResponseDto,
  })
  async getMenu(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: GetMenuRequestDto,
  ) {
    const result = await this.menuService.getMenu(query);
    return {
      message: 'The specific menu was retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new menu' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The new menu was created successfully',
    type: MenuResponseDto,
  })
  async createMenu(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: CreateMenuDto,
  ) {
    const result = await this.menuService.createMenu(requestData);
    return {
      message: 'The new menu was created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The menu was updated successfully',
    type: MenuResponseDto,
  })
  async updateMenu(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true })) requestData: UpdateMenuDto,
  ) {
    const result = await this.menuService.updateMenu(slug, requestData);
    return {
      message: 'The new menu was updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The menu was deleted successfully',
    type: String,
  })
  async deleteMenu(@Param('slug') slug: string) {
    const result = await this.menuService.deleteMenu(slug);
    return {
      message: 'The new menu was deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: `${result} menu was deleted successfully`,
    } as AppResponseDto<string>;
  }

  @Patch(':slug/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore menu' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The menu was restored successfully',
    type: MenuResponseDto,
  })
  async restoreMenu(@Param('slug') slug: string) {
    const result = await this.menuService.restoreMenu(slug);
    return {
      message: 'The new menu was restored successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<MenuResponseDto>;
  }
}
