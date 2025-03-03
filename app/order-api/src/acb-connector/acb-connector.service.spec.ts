import { Test, TestingModule } from '@nestjs/testing';
import { ACBConnectorService } from './acb-connector.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { ACBConnectorConfig } from './acb-connector.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('ACBConnectorService', () => {
  let service: ACBConnectorService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let acbConfigRepositoryMock: MockType<Repository<ACBConnectorConfig>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ACBConnectorService,
        {
          provide: getRepositoryToken(ACBConnectorConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    service = module.get<ACBConnectorService>(ACBConnectorService);
    acbConfigRepositoryMock = module.get(
      getRepositoryToken(ACBConnectorConfig),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
