import { Test, TestingModule } from '@nestjs/testing';
import { AccumulatedPointService } from './accumulated-point.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccumulatedPoint } from './entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from './entities/accumulated-point-transaction-history.entity';
import { User } from 'src/user/user.entity';
import { Order } from 'src/order/order.entity';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';

describe('AccumulatedPointService', () => {
  let service: AccumulatedPointService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(5), // 5% tích điểm
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccumulatedPointService,
        {
          provide: getRepositoryToken(AccumulatedPoint),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(AccumulatedPointTransactionHistory),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        SystemConfigService,
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccumulatedPointService>(AccumulatedPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
