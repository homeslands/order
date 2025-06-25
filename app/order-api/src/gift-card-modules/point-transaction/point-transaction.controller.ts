import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
  Post,
  Body,
} from '@nestjs/common';
import { PointTransactionService } from './point-transaction.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { PointTransactionResponseDto } from './dto/point-transaction-response.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { FindAllPointTransactionDto } from './dto/find-all-point-transaction.dto';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';

@Controller('point-transaction')
@ApiBearerAuth()
@ApiTags('Point Transaction Resources')
export class PointTransactionController {
  constructor(
    private readonly pointTransactionService: PointTransactionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create the point transaction' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: PointTransactionResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    req: CreatePointTransactionDto,
  ) {
    const result = await this.pointTransactionService.create(req);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PointTransactionResponseDto>;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve the point transactions' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: PointTransactionResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    req: FindAllPointTransactionDto,
  ) {
    const result = await this.pointTransactionService.findAll(req);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<PointTransactionResponseDto>>;
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve the point transaction' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: PointTransactionResponseDto,
  })
  async findOne(@Param('slug') slug: string) {
    const result = await this.pointTransactionService.findOne(slug);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<PointTransactionResponseDto>;
  }
}
