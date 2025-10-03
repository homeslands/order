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
  UpdateVoucherOrderRequestDto,
} from './order.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrinterJobResponseDto } from 'src/printer/printer.dto';
import { CurrentUser } from 'src/user/user.decorator';
import { CurrentUserDto } from 'src/user/user.dto';
import {
  DistanceAndDurationResponseDto,
  LocationResponseDto,
  RouteAndDirectionResponseDto,
  SuggestionAddressResultResponseDto,
} from 'src/google-map/dto/google-map.response.dto';
import { GoogleMapService } from 'src/google-map/google-map.service';
import {
  GetAddressDirectionDto,
  GetAddressDistanceAndDurationDto,
} from 'src/google-map/dto/google-map.request.dto';

@ApiTags('Order')
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly googleMapService: GoogleMapService,
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
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    currentUserDto: CurrentUserDto,
  ) {
    const result = await this.orderService.createOrder(
      requestData,
      currentUserDto.scope?.role,
    );
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
    const result = await this.orderService.createOrder(requestData, null);
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

  @Patch(':slug/voucher')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update voucher order' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update voucher order successfully',
    type: OrderResponseDto,
  })
  async updateVoucherOrder(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: UpdateVoucherOrderRequestDto,
  ) {
    const result = await this.orderService.updateVoucherOrder(
      slug,
      requestData,
    );
    return {
      message: 'Update voucher order successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderResponseDto>;
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Patch(':slug/voucher/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update voucher order public' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Update voucher order successfully',
    type: OrderResponseDto,
  })
  async updateVoucherOrderPublic(
    @Param('slug') slug: string,
    @Session() session: Record<string, any>,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    requestData: UpdateVoucherOrderRequestDto,
  ) {
    if (!session.orders) {
      session.orders = [] as string[];
    }
    const result = await this.orderService.updateVoucherOrderPublic(
      slug,
      session.orders,
      requestData,
    );
    return {
      message: 'Update voucher order successfully',
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

  @Patch(':slug/re-print-failed-invoice-printer-jobs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-print failed invoice printer jobs' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Re-print failed invoice printer jobs successfully',
    type: PrinterJobResponseDto,
    isArray: true,
  })
  async rePrintFailedInvoicePrinterJobs(@Param('slug') slug: string) {
    const result =
      await this.orderService.rePrintFailedInvoicePrinterJobs(slug);
    return {
      message: 'Re-print failed invoice printer jobs successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PrinterJobResponseDto[]>;
  }

  @Get('delivery/address/suggestion/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve address' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Address suggestion has been retrieved successfully',
    type: SuggestionAddressResultResponseDto,
    isArray: true,
  })
  async findAddressForOrder(@Param('name') name: string) {
    const result = await this.googleMapService.getAddressSuggestion(name);
    return {
      message: 'Address suggestion has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<SuggestionAddressResultResponseDto[]>;
  }

  @Get('delivery/location/:placeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve address by place id' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Address has been retrieved successfully',
    type: LocationResponseDto,
  })
  async findAddressByPlaceIdForOrder(@Param('placeId') placeId: string) {
    const result = await this.googleMapService.getLocationByPlaceId(placeId);
    return {
      message: 'Address has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<LocationResponseDto>;
  }

  @Get('delivery/direction')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get address direction' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Address direction has been retrieved successfully',
    type: RouteAndDirectionResponseDto,
  })
  async getAddressDirectionForOrder(
    @Query(new ValidationPipe({ transform: true }))
    option: GetAddressDirectionDto,
  ) {
    const result = await this.googleMapService.getAddressDirection(option);
    return {
      message: 'Address direction has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<RouteAndDirectionResponseDto>;
  }

  @Get('delivery/distance-and-duration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get address distance and duration' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description:
      'Address distance and duration has been retrieved successfully',
    type: DistanceAndDurationResponseDto,
  })
  async getAddressDistanceAndDurationForOrder(
    @Query(new ValidationPipe({ transform: true }))
    option: GetAddressDistanceAndDurationDto,
  ) {
    const result = await this.googleMapService.getDistanceAndDuration(option);
    return {
      message: 'Address distance and duration has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<DistanceAndDurationResponseDto>;
  }
}
