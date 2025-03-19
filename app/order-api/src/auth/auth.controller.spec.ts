import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/logger/logger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { ConfigService } from '@nestjs/config';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'src/logger/logger.entity';
import { Branch } from 'src/branch/branch.entity';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/file.entity';
import { MailService } from 'src/mail/mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ForgotPasswordToken } from './forgot-password-token.entity';
import { Role } from 'src/role/role.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { MailProducer } from 'src/mail/mail.producer';
import { VerifyEmailToken } from './verify-email-token.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { AuthUtils } from './auth.utils';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        FileService,
        SystemConfigService,
        MailProducer,
        TransactionManagerService,
        AuthUtils,
        {
          provide: 'BullQueue_mail',
          useValue: {},
        },
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(File),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(VerifyEmailToken),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Logger),
          useFactory: repositoryMockFactory,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-token'),
          },
        },
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
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console, // Mock logger (or a custom mock)
        },
        LoggerService,
        {
          provide: getRepositoryToken(ForgotPasswordToken),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
        },
        MailService,
        { provide: MailerService, useValue: {} },
        LoggerService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    // it('should throw an unauthorized exception if login fails', () => {
    //   expect(
    //     controller.login({ phonenumber: 'invalid', password: 'invalid' }),
    //   ).rejects.toThrow(UnauthorizedException);
    // });
    // it('should return an access token if login succeeds', async () => {
    //   const mockResult = { accessToken: 'mocked-token' };
    //   const mockRequest = {
    //     method: 'POST',
    //     originalUrl: '/auth/login',
    //   };
    //   expect(
    //     controller.login(
    //       { phonenumber: 'johndoe', password: 'johndoe' },
    //       mockRequest as any,
    //     ),
    //   ).resolves.toEqual(mockResult);
    // });
  });
});
