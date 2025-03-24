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
import { ChefOrderService } from './chef-order.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  ChefOrderResponseDto,
  QueryGetChefOrderRequestDto,
  UpdateChefOrderRequestDto,
} from './chef-order.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';

@ApiTags('Chef Order')
@Controller('chef-order')
@ApiBearerAuth()
export class ChefOrderController {
  constructor(private readonly chefOrderService: ChefOrderService) {}

  @Post('order/:slug')
  @HasRoles(
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
    RoleEnum.Chef,
    RoleEnum.Staff,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create chef orders from an order' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The chef orders were created successfully',
    type: ChefOrderResponseDto,
    isArray: true,
  })
  async create(@Param('slug') slug: string) {
    const result = await this.chefOrderService.create(slug);
    return {
      message: 'The chef orders were created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefOrderResponseDto[]>;
  }

  @Get('group-by-chef-area')
  @HasRoles(
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
    RoleEnum.Chef,
    RoleEnum.Staff,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all chef orders group by chef area',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The chef orders were retrieved successfully',
    type: ChefAreaResponseDto,
    isArray: true,
  })
  async getAllGroupByChefArea(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryGetChefOrderRequestDto,
  ) {
    const result = await this.chefOrderService.getAllGroupByChefArea(query);
    return {
      message: 'The chef orders were retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefAreaResponseDto[]>;
  }

  @Get('specific/:slug')
  @HasRoles(
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
    RoleEnum.Chef,
    RoleEnum.Staff,
  )
  // @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get specific chef order',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The chef order was retrieved successfully',
    type: ChefAreaResponseDto,
    isArray: true,
  })
  async getSpecific(@Param('slug') slug: string) {
    const result = await this.chefOrderService.getSpecific(slug);
    return {
      message: 'The chef order was retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefOrderResponseDto>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update chef order successfully',
    type: ChefAreaResponseDto,
  })
  @ApiOperation({ summary: 'Update chef order' })
  @ApiResponse({ status: 200, description: 'Update chef order successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef order to be updated',
    required: true,
    example: '',
  })
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  async update(
    @Param('slug') slug: string,
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateData: UpdateChefOrderRequestDto,
  ) {
    const result = await this.chefOrderService.update(slug, updateData);

    return {
      message: 'Chef order have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefOrderResponseDto>;
  }
}
