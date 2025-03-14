import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Role } from 'src/role/role.entity';
import { Authority } from 'src/authority/authority.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(Permission),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Authority),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Role),
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
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
