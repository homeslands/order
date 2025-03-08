import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getBanners,
  getSpecificBanner,
  createBanner,
  updateBanner,
  uploadBannerImage,
  deleteBanner,
} from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Banner API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBanners', () => {
    it('should call get banners endpoint correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'test-banner',
              title: 'Test Banner',
              content: 'Test Content',
              imageUrl: 'http://example.com/image.jpg',
              isActive: true,
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getBanners()
      expect(http.get).toHaveBeenCalledWith('/banner')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getBanners()).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getSpecificBanner', () => {
    it('should call get specific banner endpoint correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'test-banner',
          title: 'Test Banner',
          content: 'Test Content',
          url: 'http://example.com',
          useButtonUrl: true,
          image: 'http://example.com/image.jpg',
          isActive: true,
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getSpecificBanner('test-banner')
      expect(http.get).toHaveBeenCalledWith('/banner/test-banner')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createBanner', () => {
    const bannerData = {
      title: 'Test Banner',
      content: 'Test Content',
      url: 'http://example.com',
      useButtonUrl: true,
    }

    it('should call create banner endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'test-banner',
          ...bannerData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createBanner(bannerData)
      expect(http.post).toHaveBeenCalledWith('/banner', bannerData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('updateBanner', () => {
    const bannerData = {
      slug: 'test-banner',
      title: 'Updated Banner',
      content: 'Updated Description',
      url: 'http://example.com',
      useButtonUrl: true,
      isActive: true,
      image: 'http://example.com/image.jpg',
    }

    it('should call update banner endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          ...bannerData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateBanner(bannerData)
      expect(http.patch).toHaveBeenCalledWith('/banner/test-banner', bannerData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('uploadBannerImage', () => {
    it('should call upload banner image endpoint correctly', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = {
        data: {
          slug: 'test-banner',
          imageUrl: 'http://example.com/new-image.jpg',
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await uploadBannerImage('test-banner', mockFile)
      expect(http.patch).toHaveBeenCalledWith(
        '/banner/test-banner/upload',
        expect.any(FormData),
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteBanner', () => {
    it('should call delete banner endpoint correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'test-banner',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteBanner('test-banner')
      expect(http.delete).toHaveBeenCalledWith('/banner/test-banner')
      expect(result).toEqual(mockResponse.data)
    })
  })
})
