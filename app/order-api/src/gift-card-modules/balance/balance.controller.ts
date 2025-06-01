import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { UpdateBalanceDto } from './dto/update-balance.dto';
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBalanceDto: UpdateBalanceDto) {
  //   return this.balanceService.update(+id, updateBalanceDto);
  // }
}
