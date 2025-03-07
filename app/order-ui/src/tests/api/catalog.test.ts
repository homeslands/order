import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import { getCatalog, createCatalog, updateCatalog, deleteCatalog } from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Catalog API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCatalog', () => {
    it('should call get catalogs endpoint correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'test-catalog',
              name: 'Test Catalog',
              description: 'Test Description',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getCatalog()
      expect(http.get).toHaveBeenCalledWith('/catalogs')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getCatalog()).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('createCatalog', () => {
    const catalogData = {
      name: 'New Catalog',
      description: 'New Description',
    }

    it('should call create catalog endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'new-catalog',
          ...catalogData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createCatalog(catalogData)
      expect(http.post).toHaveBeenCalledWith('/catalogs', catalogData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid catalog data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createCatalog(catalogData)).rejects.toEqual(mockError)
    })
  })

  describe('updateCatalog', () => {
    const catalogData = {
      slug: 'test-catalog',
      name: 'Updated Catalog',
      description: 'Updated Description',
    }

    it('should call update catalog endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          ...catalogData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateCatalog(catalogData)
      expect(http.patch).toHaveBeenCalledWith(
        '/catalogs/test-catalog',
        catalogData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle catalog not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Catalog not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateCatalog(catalogData)).rejects.toEqual(mockError)
    })
  })

  describe('deleteCatalog', () => {
    it('should call delete catalog endpoint correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'test-catalog',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteCatalog('test-catalog')
      expect(http.delete).toHaveBeenCalledWith('/catalogs/test-catalog')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle catalog not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Catalog not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteCatalog('non-existent')).rejects.toEqual(mockError)
    })

    it('should handle server error during delete', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deleteCatalog('test-catalog')).rejects.toEqual(SERVER_ERROR)
    })
  })
})
