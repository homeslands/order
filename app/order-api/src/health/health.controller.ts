import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/auth/decorator/public.decorator';

@ApiTags('Healthcheck')
@Controller('health')
@ApiExcludeController(true)
export class HealthController {
  private readonly version: string = this.configService.get<string>('VERSION');

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private httpHealthIndicator: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  check() {
    return this.healthCheckService.check([
      () =>
        this.httpHealthIndicator.pingCheck(
          'order-api',
          `http://localhost:8080/api/${this.version}/hello`,
        ),
    ]);
  }
}
