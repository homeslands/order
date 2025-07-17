import { Test, TestingModule } from '@nestjs/testing';
import { ZaloOaConnectorController } from './zalo-oa-connector.controller';
import { ZaloOaConnectorService } from './zalo-oa-connector.service';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { ZaloOaConnectorHistory } from './entity/zalo-oa-connector-history.entity';
import { ZaloOaConnectorConfig } from './entity/zalo-oa-connector.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('ZaloOaConnectorController', () => {
  let controller: ZaloOaConnectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZaloOaConnectorController],
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

    controller = module.get<ZaloOaConnectorController>(
      ZaloOaConnectorController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
