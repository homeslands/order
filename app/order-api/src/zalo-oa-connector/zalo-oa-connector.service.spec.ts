import { Test, TestingModule } from '@nestjs/testing';
import { ZaloOaConnectorService } from './zalo-oa-connector.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ZaloOaConnectorConfig } from './entity/zalo-oa-connector.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { ZaloOaConnectorHistory } from './entity/zalo-oa-connector-history.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('ZaloOaConnectorService', () => {
  let service: ZaloOaConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZaloOaConnectorService,
        {
          provide: getRepositoryToken(ZaloOaConnectorConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ZaloOaConnectorHistory),
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

    service = module.get<ZaloOaConnectorService>(ZaloOaConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
