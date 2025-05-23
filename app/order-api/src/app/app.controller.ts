import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { TErrorCode } from './app.validation';
import { AppResponseDto } from './app.dto';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipThrottle()
  @Get('hello')
  @Public()
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }

  @SkipThrottle()
  @Get('error-codes')
  @Public()
  getErrorCodes(): AppResponseDto<TErrorCode> {
    const result = this.appService.getErrorCodes();
    return {
      message: 'Error codes have been retrieved successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      result,
    } as AppResponseDto<TErrorCode>;
  }
}
