/* eslint-disable @typescript-eslint/no-unused-vars */
import { Mapper } from '@automapper/core';
import { MockType } from './repository-mock.factory';

// Define a MockType for Mapper
export const mapperMockFactory: () => MockType<Mapper> = jest.fn(() => ({
  map: jest.fn((source, _sourceType, _destinationType) => source), // Mock for `map` method
  mapArray: jest.fn((sources, _sourceType, _destinationType) => sources), // Mock for `mapArray` method
}));
