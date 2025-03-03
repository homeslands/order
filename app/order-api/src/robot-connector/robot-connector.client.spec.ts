/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { RobotConnectorClient } from './robot-connector.client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';

describe('RobotConnectorClient', () => {
  let robotConnectorClient: RobotConnectorClient;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RobotConnectorClient,
        SystemConfigService,
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: repositoryMockFactory,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ROBOT_API_URL') return 'http://mock-api.com';
              return null;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => ({
              pipe: jest.fn(),
            })),
            post: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: mapperMockFactory,
        },
      ],
    }).compile();

    robotConnectorClient =
      module.get<RobotConnectorClient>(RobotConnectorClient);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(robotConnectorClient).toBeDefined();
  });

  // describe('getRobotById - get information robot from ROBOT API', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should throw exception when get failed', async () => {
  //     const mockInput: string = 'mock-robot-id';
  //     const mockResponse = {
  //       data: {
  //         status: ""
  //       } as RobotResponseDto
  //     }
  //     const mockOutput  = mockResponse.data;

  //     (httpService.get as jest.Mock).mockRejectedValue(
  //       new RobotConnectorException(RobotConnectorValidation.GET_ROBOT_DATA_FAILED)
  //     );
  //     await expect(robotConnectorClient.getRobotById(mockInput)).rejects.toThrow(
  //       RobotConnectorException
  //     );
  //   });
  //   // it('should get success', async () => {
  //   //   const mockInput: string = 'mock-robot-id';
  //   //   const mockResponse = {
  //   //     data: {
  //   //       status: ""
  //   //     } as RobotResponseDto
  //   //   }
  //   //   const mockOutput  = mockResponse.data;

  //   //   (httpService.get as jest.Mock).mockResolvedValue(mockResponse);
  //   //   expect(await robotConnectorClient.getRobotById(mockInput)).toEqual(mockOutput);
  //   // });
  // });
});
