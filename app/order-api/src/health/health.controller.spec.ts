import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HttpModule],
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SALT_ROUNDS') {
                return 10;
              }
              return null;
            }),
          },
        },
      ],
      // providers: [
      //   {
      //     provide: HealthCheckService,
      //     useValue: {
      //       check: jest.fn().mockResolvedValue({
      //         status: 'ok',
      //         info: {
      //           'nestjs-docs': {
      //             status: 'up',
      //           },
      //         },
      //         error: {},
      //         details: {
      //           'nestjs-docs': {
      //             status: 'up',
      //           },
      //         },
      //       }),
      //     },
      //   },
      //   HttpHealthIndicator,
      // ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
