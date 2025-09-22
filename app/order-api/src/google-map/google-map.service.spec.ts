import { Test, TestingModule } from '@nestjs/testing';
import { GoogleMapService } from './google-map.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GoogleMapConnectorClient } from './google-map-connector.client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('AddressService', () => {
  let service: GoogleMapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
      ],
    }).compile();

    service = module.get<GoogleMapService>(GoogleMapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
