import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  createBankConnector,
  getBankConnector,
  updateBankConnector,
} from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Bank API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBankConnector', () => {
    it('should call get banks endpoint with correct parameters', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'test-bank',
              xProviderId: '123',
              xService: 'Service',
              xOwnerNumber: '1234567890',
              xOwnerType: 'Personal',
              beneficiaryName: 'John Doe',
              virtualAccountPrefix: '123',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getBankConnector()

      expect(http.get).toHaveBeenCalledWith('/acb-connector')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      //   const params = { page: 1, limit: 10 }
      await expect(getBankConnector()).rejects.toEqual(SERVER_ERROR)
    })

    it('should handle undefined response', async () => {
      ;(http.get as Mock).mockResolvedValue(undefined)
      await expect(getBankConnector()).rejects.toThrow('No data found')
    })

    it('should handle response without data', async () => {
      ;(http.get as Mock).mockResolvedValue({})
      await expect(getBankConnector()).rejects.toThrow('No data found')
    })

    it('should handle no response error', async () => {
      const noResponseError = new Error('No response')
      ;(http.get as Mock).mockRejectedValue(noResponseError)
      await expect(getBankConnector()).rejects.toThrow('No response')
    })

    it('should handle timeout error', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      ;(http.get as Mock).mockRejectedValue(timeoutError)
      await expect(getBankConnector()).rejects.toThrow('Request timeout')
    })

    it('should handle network connection error', async () => {
      const networkError = new Error('Network Error')
      ;(http.get as Mock).mockRejectedValue(networkError)
      await expect(getBankConnector()).rejects.toThrow('Network Error')
    })
  })

  describe('createBankConnector', () => {
    it('should call create bank connector endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'test-bank',
          xProviderId: '123',
          xService: 'Service',
          xOwnerNumber: '1234567890',
          xOwnerType: 'Personal',
          beneficiaryName: 'John Doe',
          virtualAccountPrefix: '123',
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      const result = await createBankConnector(bankData)

      expect(http.post).toHaveBeenCalledWith('/acb-connector', bankData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Bank connector already exists' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)

      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(createBankConnector(bankData)).rejects.toEqual(mockError)
    })

    it('should handle server error', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(createBankConnector(bankData)).rejects.toEqual(SERVER_ERROR)
    })

    it('should handle undefined response', async () => {
      ;(http.post as Mock).mockResolvedValue(undefined)
      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(createBankConnector(bankData)).rejects.toThrow(
        'No data found',
      )
    })

    it('should handle response without data', async () => {
      ;(http.post as Mock).mockResolvedValue({})
      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(createBankConnector(bankData)).rejects.toThrow(
        'No data found',
      )
    })

    it('should handle no response error', async () => {
      const noResponseError = new Error('No response')
      ;(http.post as Mock).mockRejectedValue(noResponseError)
      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(createBankConnector(bankData)).rejects.toThrow('No response')
    })

    it('should handle timeout error', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      ;(http.post as Mock).mockRejectedValue(timeoutError)
      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(createBankConnector(bankData)).rejects.toThrow(
        'Request timeout',
      )
    })

    it('should handle network connection error', async () => {
      const networkError = new Error('Network Error')
      ;(http.post as Mock).mockRejectedValue(networkError)
      const bankData = {
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(createBankConnector(bankData)).rejects.toThrow(
        'Network Error',
      )
    })
  })

  describe('updateBankConnector', () => {
    it('should call update bank endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'test-bank',
          xProviderId: '123',
          xService: 'Service',
          xOwnerNumber: '1234567890',
          xOwnerType: 'Personal',
          beneficiaryName: 'John Doe',
          virtualAccountPrefix: '123',
        },
      }
      ;(http.put as Mock).mockResolvedValue(mockResponse)

      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      const result = await updateBankConnector(bankData)

      expect(http.put).toHaveBeenCalledWith(
        `/acb-connector/${bankData.slug}`,
        bankData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle bank not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Bank not found' },
        },
      }
      ;(http.put as Mock).mockRejectedValue(mockError)

      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(updateBankConnector(bankData)).rejects.toEqual(mockError)
    })

    it('should handle server error', async () => {
      ;(http.put as Mock).mockRejectedValue(SERVER_ERROR)
      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(updateBankConnector(bankData)).rejects.toEqual(SERVER_ERROR)
    })

    it('should handle undefined response', async () => {
      ;(http.put as Mock).mockResolvedValue(undefined)
      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(updateBankConnector(bankData)).rejects.toThrow(
        'No data found',
      )
    })

    it('should handle response without data', async () => {
      ;(http.put as Mock).mockResolvedValue({})
      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(updateBankConnector(bankData)).rejects.toThrow(
        'No data found',
      )
    })

    it('should handle no response error', async () => {
      const noResponseError = new Error('No response')
      ;(http.put as Mock).mockRejectedValue(noResponseError)
      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(updateBankConnector(bankData)).rejects.toThrow('No response')
    })

    it('should handle timeout error', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      ;(http.put as Mock).mockRejectedValue(timeoutError)
      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(updateBankConnector(bankData)).rejects.toThrow(
        'Request timeout',
      )
    })

    it('should handle network connection error', async () => {
      const networkError = new Error('Network Error')
      ;(http.put as Mock).mockRejectedValue(networkError)
      const bankData = {
        slug: 'test-bank',
        xProviderId: '123',
        xService: 'Service',
        xOwnerNumber: '1234567890',
        xOwnerType: 'Personal',
        beneficiaryName: 'John Doe',
        virtualAccountPrefix: '123',
      }
      await expect(updateBankConnector(bankData)).rejects.toThrow(
        'Network Error',
      )
    })
  })
})
