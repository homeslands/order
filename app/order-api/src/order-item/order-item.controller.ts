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
  updateOrderItemNoteRequestDto,
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

  @Patch(':slug/note')
  @ApiOperation({ summary: 'Update order item note' })
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Order item note updated successfully',
    type: OrderItemResponseDto,
  })
  async updateOrderItemNote(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: updateOrderItemNoteRequestDto,
  ) {
    const result = await this.orderItemService.updateOrderItemNote(
      slug,
      requestData,
    );
    return {
      message: 'Order item note updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderItemResponseDto>;
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update order item' })
  @HttpCode(HttpStatus.OK)
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Order item updated successfully',
    type: OrderItemResponseDto,
  })
  async updateOrderItem(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ transform: true }))
    requestData: UpdateOrderItemRequestDto,
  ) {
    const result = await this.orderItemService.updateOrderItem(
      slug,
      requestData,
    );
    return {
      message: 'Order item updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<OrderItemResponseDto>;
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
