import {
  Controller,
  Get,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorator/public.decorator';
import { GetLoggerRequestDto, LoggerResponseDto } from './logger.dto';
import { AppPaginatedResponseDto, AppResponseDto } from 'src/app/app.dto';
import { ApiResponseWithType } from 'src/app/app.decorator';

@Controller('logger')
@ApiBearerAuth()
@ApiTags('Logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @Public()
  @ApiQuery({ name: 'level', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiOperation({ summary: 'Retrieve all logs' })
  @ApiResponseWithType({
    status: HttpStatus.OK,
    description: 'All logs have been retrieved successfully',
    type: LoggerResponseDto,
    isArray: true,
  })
  async getAllLogs(
    @Query(new ValidationPipe({ transform: true }))
    query: GetLoggerRequestDto,
  ): Promise<AppResponseDto<AppPaginatedResponseDto<LoggerResponseDto>>> {
    const result = await this.loggerService.getAllLogs(query);
    return {
      message: 'All logs have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<AppPaginatedResponseDto<LoggerResponseDto>>;
  }
}
