import { Test, TestingModule } from '@nestjs/testing';
import { AuthorityGroupService } from './authority-group.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { AuthorityGroup } from './authority-group.entity';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from 'src/permission/permission.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

describe('AuthorityGroupService', () => {
  let service: AuthorityGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorityGroupService,
        TransactionManagerService,
        {
          provide: getRepositoryToken(AuthorityGroup),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Permission),
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

    service = module.get<AuthorityGroupService>(AuthorityGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
