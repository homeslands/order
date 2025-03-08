import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import { getRole } from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Role API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRole', () => {
    it('should fetch roles correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'admin',
              name: 'Admin',
              description: 'Administrator role',
            },
            {
              slug: 'user',
              name: 'User',
              description: 'Regular user role',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getRole()
      expect(http.get).toHaveBeenCalledWith('/role')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getRole()).rejects.toEqual(SERVER_ERROR)
    })

    it('should handle empty roles list', async () => {
      const mockResponse = {
        data: {
          items: [],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getRole()
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network Error')
      ;(http.get as Mock).mockRejectedValue(networkError)
      await expect(getRole()).rejects.toThrow('Network Error')
    })
  })
})
