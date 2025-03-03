import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderItemService } from './order-item.service';
import { ApiResponseWithType } from 'src/app/app.decorator';
import {
  CreateOrderItemRequestDto,
  OrderItemResponseDto,
  UpdateOrderItemRequestDto,
} from './order-item.dto';
import { AppResponseDto } from 'src/app/app.dto';

@ApiTags('Order Item')
@Controller('order-items')
@ApiBearerAuth()
export class OrderItemController {
  constructor(private orderItemService: OrderItemService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order item' })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    description: 'New order item created successfully',
    type: OrderItemResponseDto,
  })
  async createOrderItem(@Body() requestData: CreateOrderItemRequestDto) {
    const result = await this.orderItemService.createOrderItem(requestData);
    return {
      message: 'New order item created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderItemResponseDto>;
  }

  async getOrderItems() {}

  async getOrderItem() {}

  @Patch(':slug')
  async updateOrderItem(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: UpdateOrderItemRequestDto,
  ) {
    await this.orderItemService.updateOrderItem(slug, requestData);
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete order item' })
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Order item deleted successfully',
    type: OrderItemResponseDto,
  })
  async deleteOrderItem(@Param('slug') slug: string) {
    await this.orderItemService.deleteOrderItem(slug);
    return {
      message: 'Order item deleted successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
