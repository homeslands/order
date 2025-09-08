import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query,
  Get,
  Param,
  StreamableFile,
  Put,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePaymentDto,
  GetSpecificPaymentRequestDto,
  PaymentResponseDto,
} from './payment.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { AppResponseDto } from 'src/app/app.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { ACBStatusRequestDto } from 'src/acb-connector/acb-connector.dto';
import { Throttle } from '@nestjs/throttler';
import { CurrentUserDto } from 'src/user/user.dto';
import { CurrentUser } from 'src/user/user.decorator';
import { ConfigService } from '@nestjs/config';
import { PaymentException } from './payment.exception';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {

  private NODE_ENV = this.configService.get('NODE_ENV');
  private isProd = this.NODE_ENV === 'production';

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {
  }

  @Get('specific')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate payment' })
  @ApiQuery({
    name: 'transaction',
    required: true,
    type: String,
  })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Payment has been retrieved successfully',
    type: PaymentResponseDto,
    isArray: true,
  })
  async getSpecific(
    @Query(new ValidationPipe({ transform: true }))
    query: GetSpecificPaymentRequestDto,
  ) {
    const result = await this.paymentService.getSpecific(query);
    return {
      message: 'Payment has been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PaymentResponseDto>;
  }

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate payment' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Payment has been initiated successfully',
    type: PaymentResponseDto,
    isArray: true,
  })
  async initiate(
    @CurrentUser(new ValidationPipe({ validateCustomDecorators: true }))
    user: CurrentUserDto,
    @Body(new ValidationPipe({ transform: true }))
    createPaymentDto: CreatePaymentDto,
  ) {
    const result = await this.paymentService.initiate(createPaymentDto, user);
    return {
      message: 'Payment has been initiated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PaymentResponseDto>;
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('initiate/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate payment public' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'Payment has been initiated successfully',
    type: PaymentResponseDto,
    isArray: true,
  })
  async initiatePublic(
    @Body(new ValidationPipe({ transform: true }))
    createPaymentDto: CreatePaymentDto,
  ) {
    const result = await this.paymentService.initiatePublic(createPaymentDto);
    return {
      message: 'Payment has been initiated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PaymentResponseDto>;
  }

  @Post('callback/status')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Callback' })
  // @ApiResponseWithType({
  //   status: HttpStatus.OK,
  //   description: 'Callback has been processed successfully',
  //   type: PaymentResponseDto,
  // })
  async callback(
    @Body(new ValidationPipe({ transform: true }))
    requestData: ACBStatusRequestDto,
  ) {
    const result = await this.paymentService.callback(requestData);
    return result;
  }

  @Post(':slug/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export payment' })
  async exportPayment(@Param('slug') slug: string) {
    const result = await this.paymentService.exportPayment(slug);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="payment-${new Date().toISOString()}.pdf"`,
    });
  }

  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post(':slug/export/public')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export payment public' })
  async exportPaymentPublic(@Param('slug') slug: string) {
    const result = await this.paymentService.exportPayment(slug);
    return new StreamableFile(result, {
      type: 'application/pdf',
      length: result.length,
      disposition: `attachment; filename="payment-${new Date().toISOString()}.pdf"`,
    });
  }

  @Put(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update payment' })
  @ApiExcludeEndpoint(process.env.NODE_ENV === 'production')
  async update(@Param('slug') slug: string) {
    if (this.isProd) throw new PaymentException(HttpStatus.FORBIDDEN, 'This endpoint is not available in this environment');

    await this.paymentService.update(slug);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve payments' })
  async getAll() {
    const result = await this.paymentService.getAll();
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PaymentResponseDto[]>;
  }
}
