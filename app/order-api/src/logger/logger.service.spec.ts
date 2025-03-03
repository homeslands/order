import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from './logger.entity';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { Repository } from 'typeorm';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('LoggerService', () => {
  let service: LoggerService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let loggerRepositoryMock: MockType<Repository<Logger>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: getRepositoryToken(Logger),
          useFactory: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    loggerRepositoryMock = module.get(getRepositoryToken(Logger));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
