import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import { logger } from '@/api'
import { SERVER_ERROR } from '../constants'
import { IQuery } from '@/types'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Logger API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logger', () => {
    const queryParams: IQuery = {
      order: 'DESC' as const,
      page: 1,
      pageSize: 10,
    }

    it('should call logger endpoint with correct parameters', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'test-slug',
              level: 'info',
              message: 'Test message',
              context: 'Test context',
              timestamp: '2021-09-01T00:00:00.000Z',
              pid: 1,
            },
          ],
          meta: {
            page: 1,
            total: 10,
            totalPages: 1,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await logger(queryParams)

      expect(http.get).toHaveBeenCalledWith('/logger', {
        doNotShowLoading: true,
        params: queryParams,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(logger(queryParams)).rejects.toEqual(SERVER_ERROR)
    })

    it('should handle empty response', async () => {
      const mockResponse = {
        data: {
          items: [],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await logger(queryParams)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle different query parameters', async () => {
      const differentParams = {
        order: 'DESC' as const,
        page: 2,
        pageSize: 10,
      }

      const mockResponse = {
        data: {
          items: [],
          meta: {
            page: 2,
            limit: 20,
            totalItems: 0,
            totalPages: 0,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      await logger(differentParams)
      expect(http.get).toHaveBeenCalledWith('/logger', {
        doNotShowLoading: true,
        params: differentParams,
      })
    })
  })
})
