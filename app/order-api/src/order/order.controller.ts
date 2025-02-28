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
  UpdateOrderRequestDto,
} from './order.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';

@ApiTags('Order')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
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

  @Patch(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update order successfully',
    type: OrderResponseDto,
  })
  async updateOrder(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: UpdateOrderRequestDto,
  ) {
    const result = await this.orderService.updateOrder(slug, requestData);
    return {
      message: 'Update order status successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderResponseDto>;
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponse({ status: 200, description: 'Order deleted successully' })
  async deleteOrder(@Param('slug') slug: string) {
    await this.orderService.deleteOrder(slug);
    return {
      message: 'Order will delete after 10 seconds',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
