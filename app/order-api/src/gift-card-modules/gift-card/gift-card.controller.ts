import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { GiftCardResponseDto } from './dto/gift-card-response.dto';
import { GiftCardService } from './gift-card.service';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { UseGiftCardDto } from './dto/use-gift-card.dto';
import { FindAllGiftCardDto } from './dto/find-all-gift-card.dto';

@Controller('gift-card')
@ApiTags('Gift Card Resource')
@ApiBearerAuth()
export class GiftCardController {
  /**
   *
   */
  constructor(private readonly gcService: GiftCardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve the gift cards' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: GiftCardResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    req: FindAllGiftCardDto,
  ) {
    const result = await this.gcService.findAll(req);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<GiftCardResponseDto>>;
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve the gift card' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: GiftCardResponseDto,
  })
  async findOne(@Param('slug') slug: string) {
    const result = await this.gcService.findOne(slug);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<GiftCardResponseDto>;
  }

  @Post('/use')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use the gift card' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    type: GiftCardResponseDto,
  })
  async use(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    req: UseGiftCardDto,
  ) {
    const result = await this.gcService.use(req);
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<GiftCardResponseDto>;
  }
}
