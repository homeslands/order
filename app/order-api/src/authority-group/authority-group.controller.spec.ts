import { Test, TestingModule } from '@nestjs/testing';
import { AuthorityGroupController } from './authority-group.controller';
import { AuthorityGroupService } from './authority-group.service';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { DataSource } from 'typeorm';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { AuthorityGroup } from './authority-group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from 'src/permission/permission.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

describe('AuthorityGroupController', () => {
  let controller: AuthorityGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorityGroupController],
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

    controller = module.get<AuthorityGroupController>(AuthorityGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
