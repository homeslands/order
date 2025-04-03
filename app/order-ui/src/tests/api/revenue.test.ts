import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getRevenue,
  getBranchRevenue,
  getLatestRevenue,
  getLatestRevenueForARange,
  getLatestBranchRevenueForARange,
} from '@/api'
import { SERVER_ERROR } from '../constants'
import { RevenueTypeQuery } from '@/constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Revenue API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRevenue', () => {
    const queryParams = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      type: RevenueTypeQuery.DAILY,
    }

    it('should fetch revenue data correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'revenue-1',
              date: '2024-01-01',
              totalAmount: 1000000,
              totalOrder: 10,
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getRevenue(queryParams)
      expect(http.get).toHaveBeenCalledWith('/revenue', { params: queryParams })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getRevenue(queryParams)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getBranchRevenue', () => {
    const queryParams = {
      branch: 'branch-1',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      type: RevenueTypeQuery.DAILY,
    }

    it('should fetch branch revenue correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'branch-revenue-1',
              branchId: 'branch-1',
              date: '2024-01-01',
              totalAmount: 500000,
              totalOrder: 5,
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getBranchRevenue(queryParams)
      expect(http.get).toHaveBeenCalledWith(
        `/revenue/branch/${queryParams.branch}`,
        { params: queryParams },
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getBranchRevenue(queryParams)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getLatestRevenue', () => {
    it('should fetch latest revenue correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'latest-revenue',
              date: '2024-01-31',
              totalAmount: 2000000,
              totalOrder: 20,
            },
          ],
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await getLatestRevenue()
      expect(http.patch).toHaveBeenCalledWith('/revenue/branch/latest')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getLatestRevenueForARange', () => {
    const queryParams = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      type: RevenueTypeQuery.MONTHLY,
    }

    it('should fetch latest revenue range correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'range-revenue',
              date: '2024-01-01',
              totalAmount: 3000000,
              totalOrder: 30,
            },
          ],
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await getLatestRevenueForARange(queryParams)
      expect(http.patch).toHaveBeenCalledWith('/revenue/date', {
        params: queryParams,
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getLatestBranchRevenueForARange', () => {
    const queryParams = {
      branch: 'branch-1',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      type: RevenueTypeQuery.MONTHLY,
    }

    it('should fetch latest branch revenue range correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'branch-range-revenue',
              branchId: 'branch-1',
              date: '2024-01-01',
              totalAmount: 4000000,
              totalOrder: 40,
            },
          ],
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await getLatestBranchRevenueForARange(queryParams)
      expect(http.patch).toHaveBeenCalledWith(`/revenue/branch/date`, {
        params: queryParams,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.patch as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(
        getLatestBranchRevenueForARange(queryParams),
      ).rejects.toEqual(SERVER_ERROR)
    })
  })
})
