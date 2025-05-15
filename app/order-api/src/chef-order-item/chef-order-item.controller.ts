import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { ChefOrderItemService } from './chef-order-item.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  ChefOrderItemResponseDto,
  UpdateChefOrderItemRequestDto,
  UpdateMultiChefOrderItemRequestDto,
} from './chef-order-item.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

@ApiTags('Chef Order Item')
@Controller('chef-order-item')
@ApiBearerAuth()
export class ChefOrderItemController {
  constructor(private readonly chefOrderItemService: ChefOrderItemService) {}

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update chef order item successfully',
    type: ChefOrderItemResponseDto,
  })
  @ApiOperation({ summary: 'Update chef order item' })
  @ApiResponse({
    status: 200,
    description: 'Update chef order item successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef order item to be updated',
    required: true,
    example: '',
  })
  @HasRoles(
    RoleEnum.Chef,
    RoleEnum.Staff,
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
    updateData: UpdateChefOrderItemRequestDto,
  ) {
    const result = await this.chefOrderItemService.update(slug, updateData);

    return {
      message: 'Chef order item have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefOrderItemResponseDto>;
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update multi chef order items successfully',
    type: ChefOrderItemResponseDto,
  })
  @ApiOperation({ summary: 'Update multi chef order items' })
  @ApiResponse({
    status: 200,
    description: 'Update multi chef order items successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @HasRoles(
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  async updateMulti(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    updateData: UpdateMultiChefOrderItemRequestDto,
  ) {
    const result = await this.chefOrderItemService.updateMulti(updateData);

    return {
      message: 'Chef order item have been updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefOrderItemResponseDto[]>;
  }
}
