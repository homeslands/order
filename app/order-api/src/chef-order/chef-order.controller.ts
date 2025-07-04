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
  StreamableFile,
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
  CreateChefOrderRequestDto,
  QueryGetAllChefOrderRequestDto,
  UpdateChefOrderRequestDto,
} from './chef-order.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { HasRoles } from 'src/role/roles.decorator';
import { RoleEnum } from 'src/role/role.enum';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';

@ApiTags('Chef Order')
@Controller('chef-order')
@ApiBearerAuth()
export class ChefOrderController {
  constructor(private readonly chefOrderService: ChefOrderService) {}

  @Post()
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
  async create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    requestData: CreateChefOrderRequestDto,
  ) {
    const result = await this.chefOrderService.create(requestData);
    return {
      message: 'The chef orders were created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<ChefOrderResponseDto[]>;
  }

  @Get()
  @HasRoles(
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
    RoleEnum.Chef,
    RoleEnum.Staff,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all chef orders',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The chef orders were retrieved successfully',
    type: ChefOrderResponseDto,
    isArray: true,
  })
  async getAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: QueryGetAllChefOrderRequestDto,
  ) {
    const result = await this.chefOrderService.getAllChefOrders(query);
    return {
      message: 'The chef orders were retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<ChefOrderResponseDto>>;
  }

  @Get('specific/:slug')
  @HasRoles(
    RoleEnum.SuperAdmin,
    RoleEnum.Admin,
    RoleEnum.Manager,
    RoleEnum.Chef,
    RoleEnum.Staff,
  )
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

  @Get(':slug/export')
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiOperation({ summary: 'Export chef order' })
  @HttpCode(HttpStatus.OK)
  async exportChefOrder(@Param('slug') slug: string): Promise<StreamableFile> {
    const result = await this.chefOrderService.exportPdf(slug);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="Chef-order-${new Date().toISOString()}.pdf"`,
    });
  }

  @Get(':slug/export-manual/tickets')
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @ApiOperation({ summary: 'Export chef order item ticket' })
  @HttpCode(HttpStatus.OK)
  async exportChefOrderItemTicket(
    @Param('slug') slug: string,
  ): Promise<StreamableFile> {
    const result =
      await this.chefOrderService.exportChefOrderItemTicketPdfManual(slug);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="Chef-order-${new Date().toISOString()}.pdf"`,
    });
  }

  @Post(':slug/test-export/tickets/:maxCount')
  @HasRoles(
    RoleEnum.Staff,
    RoleEnum.Chef,
    RoleEnum.Manager,
    RoleEnum.Admin,
    RoleEnum.SuperAdmin,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Print chef order item ticket',
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The chef order item ticket was printed successfully',
    type: String,
  })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the chef order to be printed',
    required: true,
    example: '',
  })
  @ApiParam({
    name: 'maxCount',
    description:
      'The maximum number of times to print the chef order item ticket',
    required: true,
    example: 10,
  })
  async printer(
    @Param('slug') slug: string,
    @Param('maxCount') maxCount: number,
  ) {
    await this.chefOrderService.printChefOrderTest(slug, maxCount);
    return {
      message: 'The chef order was printed successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result: 'Printing chef order successfully',
    } as AppResponseDto<string>;
  }
}
