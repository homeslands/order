import { DataSource, QueryRunner } from 'typeorm';
import { MockType } from './repository-mock.factory';

export const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(
  () => ({
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      release: jest.fn(),
      startTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    }),
  }),
);
