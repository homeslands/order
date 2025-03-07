import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getVouchers,
  getSpecificVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
} from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Voucher API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getVouchers', () => {
    const queryParams = {
      minOrderValue: 100000,
      date: '2024-01-01',
      isActive: true,
    }

    it('should fetch vouchers correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'voucher-1',
              title: 'New Year Voucher',
              code: 'NY2024',
              value: 50000,
              maxUsage: 100,
              isActive: true,
              minOrderValue: 100000,
              remainingUsage: 50,
              startDate: '2024-01-01',
              endDate: '2024-02-01',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getVouchers(queryParams)
      expect(http.get).toHaveBeenCalledWith('/voucher', { params: queryParams })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getVouchers(queryParams)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getSpecificVoucher', () => {
    it('should fetch specific voucher by slug', async () => {
      const mockResponse = {
        data: {
          slug: 'voucher-1',
          title: 'New Year Voucher',
          code: 'NY2024',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSpecificVoucher({ slug: 'voucher-1' })
      expect(http.get).toHaveBeenCalledWith('/voucher/specific', {
        params: { slug: 'voucher-1' },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch specific voucher by code', async () => {
      const mockResponse = {
        data: {
          slug: 'voucher-1',
          code: 'NY2024',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSpecificVoucher({ code: 'NY2024' })
      expect(http.get).toHaveBeenCalledWith('/voucher/specific', {
        params: { code: 'NY2024' },
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createVoucher', () => {
    const voucherData = {
      title: 'New Voucher',
      code: 'NEW2024',
      value: 50000,
      maxUsage: 100,
      minOrderValue: 100000,
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-02-01',
    }

    it('should create voucher correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'new-voucher',
          ...voucherData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createVoucher(voucherData)
      expect(http.post).toHaveBeenCalledWith('/voucher', voucherData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid voucher data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createVoucher(voucherData)).rejects.toEqual(mockError)
    })
  })

  describe('updateVoucher', () => {
    const updateData = {
      slug: 'voucher-1',
      title: 'Updated Voucher',
      code: 'UPD2024',
      value: 75000,
      maxUsage: 150,
      minOrderValue: 150000,
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-03-01',
    }

    it('should update voucher correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateVoucher(updateData)
      expect(http.patch).toHaveBeenCalledWith('/voucher/voucher-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle voucher not found', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Voucher not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateVoucher(updateData)).rejects.toEqual(mockError)
    })
  })

  describe('deleteVoucher', () => {
    it('should delete voucher correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteVoucher('voucher-1')
      expect(http.delete).toHaveBeenCalledWith('/voucher/voucher-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle voucher not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Voucher not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteVoucher('non-existent')).rejects.toEqual(mockError)
    })
  })

  describe('validateVoucher', () => {
    const validateData = {
      voucher: 'voucher-1',
      user: 'user-1',
    }

    it('should validate voucher correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'voucher-1',
          code: 'VALID2024',
          value: 50000,
          remainingUsage: 49,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await validateVoucher(validateData)
      expect(http.post).toHaveBeenCalledWith('/voucher/validate', validateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle invalid voucher', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid or expired voucher' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(validateVoucher(validateData)).rejects.toEqual(mockError)
    })

    it('should handle validation error for used voucher', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Voucher already used by user' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(validateVoucher(validateData)).rejects.toEqual(mockError)
    })
  })
})
