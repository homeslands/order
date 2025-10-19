import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ValidationPipe,
  Query,
  HttpStatus,
  HttpCode,
  Inject,
  Logger,
} from '@nestjs/common';
import { CoinPolicyService } from './coin-policy.service';
import {
  ToggleCoinPolicyActivationDto,
  UpdateCoinPolicyDto,
} from './dto/update-coin-policy.dto';
import { AppResponseDto } from 'src/app/app.dto';
import { CoinPolicyResponseDto } from './dto/coin-policy-response.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithType } from 'src/app/app.decorator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller('coin-policy')
@ApiTags('Coin Policy Resource')
@ApiBearerAuth()
export class CoinPolicyController {
  constructor(
    private readonly coinPolicyService: CoinPolicyService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all coin policies' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: '',
    type: CoinPolicyResponseDto,
    isArray: true,
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: any,
  ) {
    const context = `${CoinPolicyController.name}.${this.findAll.name}`;
    this.logger.log(
      `REST request to find all Coin Policy: ${JSON.stringify(query)}`,
      context,
    );

    const result = await this.coinPolicyService.findAll();
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<CoinPolicyResponseDto[]>;
  }

  @Patch(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update a coin policy by slug' })
  async update(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateCoinPolicyDto: UpdateCoinPolicyDto,
  ) {
    const context = `${CoinPolicyController.name}.${this.update.name}`;
    this.logger.log(
      `REST request to update Coin Policy: ${JSON.stringify(updateCoinPolicyDto)}`,
      context,
    );

    await this.coinPolicyService.update(slug, updateCoinPolicyDto);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }

  @Patch(':slug/activation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Toggle a coin policy activation by slug' })
  async toggleActivation(
    @Param('slug') slug: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    toggleCoinPolicyActivationDto: ToggleCoinPolicyActivationDto,
  ) {
    const context = `${CoinPolicyController.name}.${this.toggleActivation.name}`;
    this.logger.log(
      `REST request to active Coin Policy: ${JSON.stringify(toggleCoinPolicyActivationDto)}`,
      context,
    );

    await this.coinPolicyService.toggleActivation(
      slug,
      toggleCoinPolicyActivationDto,
    );
    return {
      statusCode: HttpStatus.NO_CONTENT,
      timestamp: new Date().toISOString(),
    } as AppResponseDto<void>;
  }
}
