import { vi } from 'vitest'

export const httpMock = {
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

// Mock the http module
vi.doMock('@/utils', () => ({
  http: httpMock,
}))
