import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ChefOrderService } from './chef-order.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { ChefOrderResponseDto } from './chef-order.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';

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
    RoleEnum.Staff,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create chef orders from an order' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'The chef order were created successfully',
    type: ChefOrderResponseDto,
    isArray: true,
  })
  async createMenu(@Param('slug') slug: string) {
    const result = await this.chefOrderService.create(slug);
    return {
      message: 'The chef order were created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefOrderResponseDto[]>;
  }
}
