import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Authority } from 'src/authority/authority.entity';
import { Role } from 'src/role/role.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';

describe('PermissionController', () => {
  let controller: PermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
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

    controller = module.get<PermissionController>(PermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
