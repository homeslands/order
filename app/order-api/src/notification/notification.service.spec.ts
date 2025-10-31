import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserUtils } from 'src/user/user.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { User } from 'src/user/user.entity';
import { NotificationLanguageService } from './language/notification-language.service';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseDeviceToken } from './firebase/firebase-device-token.entity';
import { SystemConfig } from 'src/system-config/system-config.entity';
import { ConfigService } from '@nestjs/config';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        TransactionManagerService,
        UserUtils,
        {
          provide: getRepositoryToken(Notification),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        { provide: DataSource, useFactory: dataSourceMockFactory },
        NotificationLanguageService,
        SystemConfigService,
        FirebaseService,
        ConfigService,
        {
          provide: getRepositoryToken(FirebaseDeviceToken),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
