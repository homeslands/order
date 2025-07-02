import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindByFieldDto } from './dto/find-by-field.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';

@Controller('balance')
@ApiTags('Balance Resource')
@ApiBearerAuth()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get balance by field' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'The balance was retrieved successfully',
    type: BalanceResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async findByField(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    payload: FindByFieldDto,
  ) {
    const result = await this.balanceService.findOneByField(payload);
    return {
      message: 'The balance was retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<BalanceResponseDto>;
  }
}
