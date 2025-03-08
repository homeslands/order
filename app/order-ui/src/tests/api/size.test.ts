import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import { getSize, createSize, updateSize, deleteSize } from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Size API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSize', () => {
    it('should fetch sizes correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'size-1',
              name: 'Small',
              description: 'Small size',
            },
            {
              slug: 'size-2',
              name: 'Medium',
              description: 'Medium size',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSize()
      expect(http.get).toHaveBeenCalledWith('/sizes')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getSize()).rejects.toEqual(SERVER_ERROR)
    })

    it('should handle empty response', async () => {
      const mockResponse = {
        data: {
          items: [],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSize()
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createSize', () => {
    const sizeData = {
      name: 'Large',
      description: 'Large size',
    }

    it('should create size correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'size-3',
          ...sizeData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createSize(sizeData)
      expect(http.post).toHaveBeenCalledWith('/sizes', sizeData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid size data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createSize(sizeData)).rejects.toEqual(mockError)
    })

    it('should handle server error during creation', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(createSize(sizeData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('updateSize', () => {
    const updateData = {
      slug: 'size-1',
      name: 'Updated Size',
      description: 'Updated description',
    }

    it('should update size correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateSize(updateData)
      expect(http.patch).toHaveBeenCalledWith('/sizes/size-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle size not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Size not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateSize(updateData)).rejects.toEqual(mockError)
    })

    it('should handle server error during update', async () => {
      ;(http.patch as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(updateSize(updateData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('deleteSize', () => {
    it('should delete size correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'size-1',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteSize('size-1')
      expect(http.delete).toHaveBeenCalledWith('/sizes/size-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle size not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Size not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteSize('non-existent')).rejects.toEqual(mockError)
    })

    it('should handle server error during delete', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deleteSize('size-1')).rejects.toEqual(SERVER_ERROR)
    })
  })
})
