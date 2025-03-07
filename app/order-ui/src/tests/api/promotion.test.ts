import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  ApplyPromotion,
  RemoveProductPromotion,
} from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Promotion API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPromotions', () => {
    it('should fetch promotions correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'promo-1',
              title: 'Summer Sale',
              branchSlug: 'branch-1',
              description: 'Summer promotion',
              startDate: '2024-01-01',
              endDate: '2024-02-01',
              type: 'PERCENTAGE',
              value: 10,
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getPromotions('branch-1')
      expect(http.get).toHaveBeenCalledWith('/promotion', {
        params: { branchSlug: 'branch-1' },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getPromotions('branch-1')).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('createPromotion', () => {
    const promotionData = {
      title: 'New Promotion',
      branchSlug: 'branch-1',
      description: 'Test promotion',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      type: 'PERCENTAGE',
      value: 15,
    }

    it('should create promotion correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'new-promo',
          ...promotionData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createPromotion(promotionData)
      expect(http.post).toHaveBeenCalledWith(
        `/promotion/${promotionData.branchSlug}`,
        promotionData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid promotion data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createPromotion(promotionData)).rejects.toEqual(mockError)
    })
  })

  describe('updatePromotion', () => {
    const updateData = {
      slug: 'promo-1',
      title: 'Updated Promotion',
      description: 'Updated description',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      type: 'FIXED',
      value: 50000,
    }

    it('should update promotion correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updatePromotion(updateData)
      expect(http.patch).toHaveBeenCalledWith('/promotion/promo-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle promotion not found', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Promotion not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updatePromotion(updateData)).rejects.toEqual(mockError)
    })
  })

  describe('deletePromotion', () => {
    it('should delete promotion correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deletePromotion('promo-1')
      expect(http.delete).toHaveBeenCalledWith('/promotion/promo-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle deletion error', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deletePromotion('promo-1')).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('ApplyPromotion', () => {
    const applyData = {
      isApplyFromToday: true,
      applicableSlugs: ['product-1', 'product-2'],
      type: 'PERCENTAGE',
      promotion: 'promo-1',
    }

    it('should apply promotion to products correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await ApplyPromotion(applyData)
      expect(http.post).toHaveBeenCalledWith(
        '/applicable-promotion/multi',
        applyData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle application error', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(ApplyPromotion(applyData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('RemoveProductPromotion', () => {
    it('should remove promotion from product correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await RemoveProductPromotion('applicable-promo-1')
      expect(http.delete).toHaveBeenCalledWith(
        '/applicable-promotion/applicable-promo-1',
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle removal error', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(
        RemoveProductPromotion('applicable-promo-1'),
      ).rejects.toEqual(SERVER_ERROR)
    })
  })
})
