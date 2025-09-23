import { Test, TestingModule } from '@nestjs/testing';
import { GoogleMapController } from './google-map.controller';
import { GoogleMapService } from './google-map.service';
import { GoogleMapConnectorClient } from './google-map-connector.client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';

describe('AddressController', () => {
  let controller: GoogleMapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleMapController],
      providers: [
        GoogleMapService,
        GoogleMapService,
        GoogleMapConnectorClient,
        HttpService,
        ConfigService,
        {
          provide: 'AXIOS_INSTANCE_TOKEN',
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Branch),
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
        SystemConfigService,
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<GoogleMapController>(GoogleMapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
