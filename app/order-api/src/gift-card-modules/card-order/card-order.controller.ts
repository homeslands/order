import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ValidationPipe,
  HttpStatus,
  Query,
  HttpCode,
} from '@nestjs/common';
import { CardOrderService } from './card-order.service';
import { CreateCardOrderDto } from './dto/create-card-order.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppResponseDto } from 'src/app/app.dto';
import { CardOrderResponseDto } from './dto/card-order-response.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { FindAllCardOrderDto } from './dto/find-all-card-order.dto';

@Controller('card-order')
@ApiTags('Card Order Resource')
@ApiBearerAuth()
export class CardOrderController {
  constructor(private readonly cardOrderService: CardOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card order' })
  @ApiResponseWithType({
    status: HttpStatus.CREATED,
    type: CardOrderResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createCardOrderDto: CreateCardOrderDto,
  ) {
    const result = await this.cardOrderService.create(createCardOrderDto);

    return {
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardOrderResponseDto>;
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all card orders' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: CardOrderResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    payload: FindAllCardOrderDto,
  ) {
    const result = await this.cardOrderService.findAll(payload);

    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardOrderResponseDto[]>;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const result = await this.cardOrderService.findOne(slug);

    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardOrderResponseDto>;
  }

  @Post(':slug/cancel')
  @ApiOperation({ summary: 'Cancel a card order' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: CardOrderResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('slug') slug: string) {
    await this.cardOrderService.cancel(slug);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
