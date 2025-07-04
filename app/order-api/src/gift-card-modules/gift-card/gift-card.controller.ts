import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { GiftCardResponseDto } from './dto/gift-card-response.dto';
import { GiftCardService } from './gift-card.service';
import { AppResponseDto } from 'src/app/app.dto';

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
  async findAll() {
    const result = await this.gcService.findAll();
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<GiftCardResponseDto[]>;
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
}
