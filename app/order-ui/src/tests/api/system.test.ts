import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getSystemConfigs,
  createSystemConfig,
  updateSystemConfigs,
  deleteSystemConfigs,
  getSystemConfigByKey,
} from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('System Config API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSystemConfigs', () => {
    it('should fetch system configs correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'config-1',
              key: 'MAX_ORDERS',
              value: '100',
              description: 'Maximum orders per day',
              createdAt: '2024-01-01',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSystemConfigs()
      expect(http.get).toHaveBeenCalledWith('/system-config')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getSystemConfigs()).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('createSystemConfig', () => {
    const configData = {
      key: 'NEW_CONFIG',
      value: '50',
      description: 'New config description',
    }

    it('should create system config correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'new-config',
          createdAt: '2024-01-01',
          ...configData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createSystemConfig(configData)
      expect(http.post).toHaveBeenCalledWith('/system-config', configData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid config data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createSystemConfig(configData)).rejects.toEqual(mockError)
    })
  })

  describe('updateSystemConfigs', () => {
    const updateData = {
      slug: 'config-1',
      key: 'MAX_ORDERS',
      value: '200',
      description: 'Updated description',
    }

    it('should update system config correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
          createdAt: '2024-01-01',
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateSystemConfigs(updateData)
      expect(http.patch).toHaveBeenCalledWith(
        '/system-config/config-1',
        updateData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle config not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Config not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateSystemConfigs(updateData)).rejects.toEqual(mockError)
    })
  })

  describe('deleteSystemConfigs', () => {
    const deleteParams = {
      key: 'MAX_ORDERS',
      slug: 'config-1',
    }

    it('should delete system config correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteSystemConfigs(deleteParams)
      expect(http.delete).toHaveBeenCalledWith('/system-config', {
        data: deleteParams,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle config not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Config not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteSystemConfigs(deleteParams)).rejects.toEqual(mockError)
    })
  })

  describe('getSystemConfigByKey', () => {
    const queryParams = {
      key: 'MAX_ORDERS',
      slug: 'config-1',
    }

    it('should fetch specific system config correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'config-1',
          key: 'MAX_ORDERS',
          value: '100',
          description: 'Maximum orders per day',
          createdAt: '2024-01-01',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSystemConfigByKey(queryParams)
      expect(http.get).toHaveBeenCalledWith('/system-config/specific', {
        params: queryParams,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle config not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Config not found' },
        },
      }
      ;(http.get as Mock).mockRejectedValue(mockError)
      await expect(getSystemConfigByKey(queryParams)).rejects.toEqual(mockError)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getSystemConfigByKey(queryParams)).rejects.toEqual(
        SERVER_ERROR,
      )
    })
  })
})
