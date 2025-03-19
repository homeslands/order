/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/logger/logger.service';
import {
  MockType,
  repositoryMockFactory,
} from 'src/test-utils/repository-mock.factory';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import {
  AuthJwtPayload,
  ForgotPasswordRequestDto,
  ForgotPasswordTokenRequestDto,
  LoginAuthRequestDto,
  RegisterAuthRequestDto,
  RegisterAuthResponseDto,
} from './auth.dto';
import bcrypt from 'bcrypt';
import { jwtServiceMockFactory } from 'src/test-utils/jwt-mock.factory';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { Logger } from 'src/logger/logger.entity';
import { AuthException } from './auth.exception';
import { Branch } from 'src/branch/branch.entity';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/file.entity';
import { ForgotPasswordToken } from './forgot-password-token.entity';
import { MailService } from 'src/mail/mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from 'src/role/role.entity';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { MailProducer } from 'src/mail/mail.producer';
import { CurrentUserDto } from 'src/user/user.dto';
import { VerifyEmailToken } from './verify-email-token.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { AuthUtils } from './auth.utils';

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: MockType<Repository<User>>;
  let forgotPasswordRepositoryMock: MockType<Repository<ForgotPasswordToken>>;
  let jwtService: MockType<JwtService>;
  let mapperMock: MockType<Mapper>;
  let systemConfigService: SystemConfigService;
  let mockDataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        FileService,
        SystemConfigService,
        TransactionManagerService,
        AuthUtils,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        MailProducer,
        {
          provide: 'BullQueue_mail',
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(File),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(VerifyEmailToken),
          useFactory: repositoryMockFactory,
        },
        {
          provide: JwtService,
          useFactory: jwtServiceMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ForgotPasswordToken),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: repositoryMockFactory,
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
        {
          provide: getRepositoryToken(Logger),
          useFactory: repositoryMockFactory,
        },
        MailService,
        { provide: MailerService, useValue: {} },
        LoggerService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepositoryMock = module.get(getRepositoryToken(User));
    forgotPasswordRepositoryMock = module.get(
      getRepositoryToken(ForgotPasswordToken),
    );
    jwtService = module.get(JwtService);
    mapperMock = module.get(MAPPER_MODULE_PROVIDER);
    systemConfigService = module.get(SystemConfigService);
    mockDataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Testing user validation func', () => {
    it('should return null if the user not found', async () => {
      // Mock input
      const mockInput = {
        phonenumber: 'phonenumber',
        password: 'password',
      };

      // Mock implementation
      userRepositoryMock.findOne.mockReturnValue(null);

      // Assertions
      expect(
        await service.validateUser(mockInput.phonenumber, mockInput.password),
      ).toBeNull();
    });

    it('should return null if the password does not match', async () => {
      // Mock input
      const mockInput = {
        phonenumber: 'phonenumber',
        password: 'password',
      };

      // Mock output
      const mockUser = {
        id: 1,
        phonenumber: 'phonenumber',
        password: 'password',
      };

      // Mock implementation
      userRepositoryMock.findOne.mockReturnValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation((hash, pass) => false);

      // Assertions
      expect(
        await service.validateUser(mockInput.phonenumber, mockInput.password),
      ).toBeNull();
    });

    it('should return a user if the user is found', async () => {
      // Mock input
      const mockInput = {
        phonenumber: 'phonenumber',
        password: 'password',
      };

      // Mock output
      const mockUser = {
        id: 1,
        phonenumber: 'phonenumber',
        password: 'password',
      };

      // Mock implementation
      userRepositoryMock.findOne.mockReturnValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation((hash, pass) => true);

      // Assertions
      expect(
        await service.validateUser(mockInput.phonenumber, mockInput.password),
      ).toEqual(mockUser);
    });
  });

  describe('Testing login func', () => {
    it('should throw an `AuthException` if login fails', async () => {
      // mock input
      const mockReq = {
        phonenumber: 'phonenumber',
        password: 'password',
      } as LoginAuthRequestDto;

      // Mock implementation
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      // Assertions
      expect(service.login(mockReq)).rejects.toThrow(AuthException);
    });

    // it('should return an access token if login succeeds', async () => {
    //   // Mock input
    //   const mockReq = {
    //     phonenumber: 'phonenumber',
    //     password: 'password',
    //   } as LoginAuthRequestDto;

    //   const mockUser = {
    //     id: 'uuid',
    //     phonenumber: 'phonenumber',
    //     password: 'password',
    //   } as User;

    //   // Mock output
    //   const mockResult: LoginAuthResponseDto = {
    //     accessToken: 'mocked-token',
    //     expireTime: '',
    //     refreshToken: 'mocked-token',
    //     expireTimeRefreshToken: '',
    //   };

    //   // Mock implementation
    //   jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
    //   jest.spyOn(service, 'generateToken').mockResolvedValue(mockResult);
    //   jwtService.sign.mockReturnValue(mockResult.accessToken);
    //   jwtService.sign.mockReturnValue(mockResult.refreshToken);

    //   // Assertions
    //   expect(await service.login(mockReq)).toEqual(mockResult);
    // });
  });

  describe('Testing register func', () => {
    it('should be thrown auth exception if the user is found', async () => {
      // mock input
      const mockInput = {
        firstName: '',
        lastName: '',
        password: '',
        phonenumber: '',
      } as RegisterAuthRequestDto;

      const mockUserEntity = {
        firstName: '',
        lastName: '',
        slug: '',
        phonenumber: '',
        password: '',
      } as User;

      // Mock implementation
      userRepositoryMock.findOne.mockReturnValue(mockUserEntity);

      // Assertions
      expect(service.register(mockInput)).rejects.toThrow(AuthException);
    });

    it('should return user if register succeeds', async () => {
      // mock input
      const mockInput = {
        firstName: '',
        lastName: '',
        password: '',
        phonenumber: '',
      } as RegisterAuthRequestDto;

      const mockUserEntity = {
        firstName: '',
        lastName: '',
        slug: '',
        phonenumber: '',
        password: '',
      } as User;

      const mockUserOutput = {
        firstName: '',
        lastName: '',
        slug: '',
        phonenumber: '',
      };

      // Mock implementation
      userRepositoryMock.findOne.mockReturnValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation((pass, saltOfRounds) => 'hashed-password');

      const queryRunner = mockDataSource.createQueryRunner();
      mockDataSource.createQueryRunner = jest.fn().mockReturnValue({
        ...queryRunner,
        manager: {
          save: jest.fn().mockResolvedValue(mockUserOutput),
        },
      });

      mapperMock.map.mockImplementation(
        (source, sourceType, destinationType) => {
          if (sourceType === RegisterAuthRequestDto && destinationType === User)
            return mockUserEntity; // Mocked User entity
          if (
            sourceType === User &&
            destinationType === RegisterAuthResponseDto
          )
            return mockUserOutput; // Mocked user response
          return null;
        },
      );

      // Assertions
      expect(await service.register(mockInput)).toEqual(mockUserOutput);
    });
  });

  describe('Testing retrieve frontend url func', () => {
    it('Should return an empty value if the frontend url is not found', async () => {
      const frontendUrl = '';
      jest.spyOn(systemConfigService, 'get').mockResolvedValue(frontendUrl);
      expect(await service.getFrontendUrl()).toEqual(frontendUrl);
    });

    it('Should return an value if the frontend url is found', async () => {
      const frontendUrl = 'mock-frontend-url';
      jest.spyOn(systemConfigService, 'get').mockResolvedValue(frontendUrl);
      expect(await service.getFrontendUrl()).toEqual(frontendUrl);
    });
  });

  describe('Testing forgot password func', () => {
    const mockRequestData: ForgotPasswordRequestDto = {
      token: 'test-token',
      newPassword: '',
    };

    const mockUser: User = {
      id: 'user-id',
      slug: '',
      firstName: '',
      lastName: '',
      password: '',
      phonenumber: '',
      role: null,
      branch: null,
      isActive: true,
      approvalOrders: [],
      ownerOrders: [],
      forgotPasswordTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerifiedEmail: false,
      isVerifiedPhonenumber: false,
      verifyEmailTokens: [],
    };

    const mockExistToken: ForgotPasswordToken = {
      id: '',
      slug: '',
      user: mockUser,
      token: '',
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAuthJwtPayload: AuthJwtPayload = {
      jti: '',
      scope: '',
      sub: 'user-id',
    };

    const mockHashedPassword = 'hashed-password';

    it('Should throw `AuthException` if the forgot token is not exsited', () => {
      const mockRequestData: ForgotPasswordRequestDto = {
        token: 'test-token',
        newPassword: '',
      };

      forgotPasswordRepositoryMock.findOne.mockReturnValue(null);
      expect(service.forgotPassword(mockRequestData)).rejects.toThrow(
        AuthException,
      );
    });

    it('Should throw `AuthException` if the forgot token is expired', () => {
      forgotPasswordRepositoryMock.findOne.mockReturnValue(mockExistToken);
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('');
      });
      expect(service.forgotPassword(mockRequestData)).rejects.toThrow(
        AuthException,
      );
    });

    it('Should throw `AuthException` if user is not found', () => {
      forgotPasswordRepositoryMock.findOne.mockReturnValue(mockExistToken);
      jest.spyOn(jwtService, 'verify').mockReturnValue({});
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockAuthJwtPayload);
      userRepositoryMock.findOne.mockReturnValue(null);
      expect(service.forgotPassword(mockRequestData)).rejects.toThrow(
        AuthException,
      );
    });

    it('Should return `0` when user forgot password successfully', async () => {
      forgotPasswordRepositoryMock.findOne.mockReturnValue(mockExistToken);
      jest.spyOn(jwtService, 'verify').mockReturnValue({});
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockAuthJwtPayload);
      userRepositoryMock.findOne.mockReturnValue(mockUser);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation((pass, saltOfRounds) => mockHashedPassword);

      expect(await service.forgotPassword(mockRequestData)).toBe(0);
    });
  });

  describe('Testing creation forgot password token func', () => {
    const mockRequestData: ForgotPasswordTokenRequestDto = {
      email: 'mock-email',
    };
    const mockUser: User = {
      id: 'user-id',
      slug: '',
      firstName: '',
      lastName: '',
      password: '',
      phonenumber: '',
      role: null,
      branch: null,
      isActive: true,
      approvalOrders: [],
      ownerOrders: [],
      forgotPasswordTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerifiedEmail: false,
      isVerifiedPhonenumber: false,
      verifyEmailTokens: [],
    };

    const mockForgotToken: ForgotPasswordToken = {
      createdAt: new Date(),
      expiresAt: new Date(),
      updatedAt: new Date(),
      id: '',
      slug: '',
      token: '',
      user: mockUser,
    };

    const mockFrontendUrl = 'mock-frontend-url';

    const mockToken = 'mock-token';

    const mockUrl = `${mockFrontendUrl}/reset-password?token=${mockToken}`;

    it('Should throw `AuthException` if user is not found', () => {
      userRepositoryMock.findOne.mockReturnValue(null);
      expect(
        service.createForgotPasswordToken(mockRequestData),
      ).rejects.toThrow(AuthException);
    });

    it('Should throw `AuthException` if forgot token exists', () => {
      userRepositoryMock.findOne.mockReturnValue(mockUser);
      forgotPasswordRepositoryMock.findOne.mockReturnValue(mockForgotToken);
      expect(
        service.createForgotPasswordToken(mockRequestData),
      ).rejects.toThrow(AuthException);
    });

    // it('Should return `url` when user is found and token does not exist', async () => {
    //   userRepositoryMock.findOne.mockReturnValue(mockUser);
    //   forgotPasswordRepositoryMock.findOne.mockReturnValue(null);

    //   jwtService.sign.mockReturnValue(mockToken);
    //   jest.spyOn(service, 'getFrontendUrl').mockResolvedValue(mockFrontendUrl);

    //   expect(await service.createForgotPasswordToken(mockRequestData)).toBe(
    //     mockUrl,
    //   );
    // });
  });

  describe('Testing avatar uploading func', () => {
    const mockUserRequest: CurrentUserDto = {
      userId: 'user-id',
      scope: {
        role: '',
        permissions: [],
      },
    };
    const mockFileRequest: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-file.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024, // size in bytes
      destination: '/tmp/uploads',
      filename: 'test-file.txt',
      path: '/tmp/uploads/test-file.txt',
      buffer: Buffer.from('Mock file content'),
      stream: null,
    };

    const mockUser: User = {
      id: 'user-id',
      slug: '',
      firstName: '',
      lastName: '',
      password: '',
      phonenumber: '',
      role: null,
      branch: null,
      isActive: true,
      approvalOrders: [],
      ownerOrders: [],
      forgotPasswordTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerifiedEmail: false,
      isVerifiedPhonenumber: false,
      verifyEmailTokens: [],
    };

    it('Should throw `AuthException` if user is not found', async () => {
      userRepositoryMock.findOne.mockReturnValue(null);
      expect(
        service.uploadAvatar(mockUserRequest, mockFileRequest),
      ).rejects.toThrow(AuthException);
    });

    it('Should upload avatar success if user is found', async () => {
      userRepositoryMock.findOne.mockReturnValue(mockUser);
      mapperMock.map.mockReturnValue(mockUser);
      expect(
        service.uploadAvatar(mockUserRequest, mockFileRequest),
      ).resolves.toBe(mockUser);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
