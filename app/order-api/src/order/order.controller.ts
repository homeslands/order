import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Session,
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
import { Public } from 'src/auth/decorator/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@ApiTags('Order')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

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

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('public')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'Create a new order successfully',
    type: CreateOrderRequestDto,
  })
  @ApiOperation({ summary: 'Create new order public' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createOrderPublic(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    requestData: CreateOrderRequestDto,
    @Session() session: Record<string, any>,
  ) {
    if (!session.orders) {
      session.orders = [] as string[];
    }
    const result = await this.orderService.createOrder(requestData);
    session.orders.push(result.slug);
    this.logger.log(
      'Session orders from createOrderPublic:',
      JSON.stringify(session),
    );

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

  // for not login user
  @Get('public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all orders by slug array' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All orders have been retrieved successfully',
    type: OrderResponseDto,
    isArray: true,
  })
  async getAllOrdersBySlugArray(@Session() session: Record<string, any>) {
    this.logger.log('Get session orders:', JSON.stringify(session));
    if (!session.orders) {
      session.orders = [] as string[];
    }
    this.logger.log('Get session orders after check:', JSON.stringify(session));
    const result = await this.orderService.getAllOrdersBySlugArray(
      session.orders,
    );
    return {
      message: 'All orders have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderResponseDto[]>;
  }

  @Get(':slug')
  @Public()
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
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
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
  @ApiResponse({ status: 200, description: 'Order deleted successully' })
  async deleteOrder(@Param('slug') slug: string) {
    await this.orderService.deleteOrder(slug);
    return {
      message: 'Order deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Delete(':slug/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete order public' })
  @ApiResponse({ status: 200, description: 'Order deleted successully' })
  async deleteOrderPublic(
    @Param('slug') slug: string,
    @Session() session: Record<string, any>,
  ) {
    if (!session.orders) {
      session.orders = [] as string[];
    }
    // don't delete order from session if delete successfully
    await this.orderService.deleteOrderPublic(slug, session.orders);
    return {
      message: 'Order deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
