import { Repository } from 'typeorm';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<object>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    remove: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
    create: jest.fn((entity) => entity),
    softDelete: jest.fn(),
    recover: jest.fn(),
  }),
);
