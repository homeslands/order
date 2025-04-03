import { Test, TestingModule } from '@nestjs/testing';
import { AuthorityController } from './authority.controller';
import { AuthorityService } from './authority.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authority } from './authority.entity';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';

describe('AuthorityController', () => {
  let controller: AuthorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorityController],
      providers: [
        AuthorityService,
        TransactionManagerService,
        {
          provide: DataSource,
          useFactory: dataSourceMockFactory,
        },
        {
          provide: getRepositoryToken(Authority),
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
      ],
    }).compile();

    controller = module.get<AuthorityController>(AuthorityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
