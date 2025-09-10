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
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { CardOrderResponseDto } from './dto/card-order-response.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { FindAllCardOrderDto } from './dto/find-all-card-order.dto';
import { InitiateCardOrderPaymentAdminDto, InitiateCardOrderPaymentDto } from './dto/initiate-card-order-payment.dto';
import { CurrentUser } from 'src/user/user.decorator';
import { CurrentUserDto } from 'src/user/user.dto';

@Controller('card-order')
@ApiTags('Card Order Resource')
@ApiBearerAuth()
export class CardOrderController {
  constructor(private readonly cardOrderService: CardOrderService) { }

  @Post('/payment/initiate')
  @ApiOperation({ summary: 'Initiate a card order payment' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: CardOrderResponseDto,
  })
  async initiatePayment(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    payload: InitiateCardOrderPaymentDto,
  ) {
    const result = await this.cardOrderService.initiatePayment(payload);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardOrderResponseDto>;
  }

  @Post('/payment/initiate/admin')
  @ApiOperation({ summary: 'Initiate a card order payment for admin' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: CardOrderResponseDto,
  })
  async initiatePaymentAdmin(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    payload: InitiateCardOrderPaymentAdminDto,
  ) {
    const result = await this.cardOrderService.initiatePaymentAdmin(payload);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CardOrderResponseDto>;
  }

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
    } as AppResponseDto<AppPaginatedResponseDto<CardOrderResponseDto>>;
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
  async cancel(
    @Param('slug') slug: string,
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true })) user: CurrentUserDto) {
    await this.cardOrderService.cancel(slug, user);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Post(':slug/gift-card/gen')
  @ApiOperation({ summary: 'Generate and use gift cards' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: CardOrderResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async generateAndRedeem(@Param('slug') slug: string) {
    await this.cardOrderService.generateAndRedeem(slug);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
