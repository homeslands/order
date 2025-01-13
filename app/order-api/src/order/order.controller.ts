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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreateOrderRequestDto,
  GetOrderRequestDto,
  OrderResponseDto,
} from './order.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';

@ApiTags('Order')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new order successfully',
    type: CreateOrderRequestDto,
  })
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createOrder(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateOrderRequestDto,
  ) {
    const result = await this.orderService.createOrder(requestData);
    return {
      message: 'Order have been created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderResponseDto>;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all orders' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All orders have been retrieved successfully',
    type: OrderResponseDto,
    isArray: true,
  })
  async getAllOrders(
    @Query(new ValidationPipe({ transform: true }))
    query: GetOrderRequestDto,
  ) {
    const result = await this.orderService.getAllOrders(query);
    return {
      message: 'All orders have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<OrderResponseDto>>;
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve order by slug' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Get order by slug successfully',
    type: OrderResponseDto,
  })
  @ApiParam({
    name: 'slug',
    description: 'The slug of the order to be retrieved',
    required: true,
    example: 'vKwq07TZM',
  })
  async getOrder(@Param('slug') slug: string) {
    const result = await this.orderService.getOrderBySlug(slug);
    return {
      message: 'Get specific order successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderResponseDto>;
  }
}
