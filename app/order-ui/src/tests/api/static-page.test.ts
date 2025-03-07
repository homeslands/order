import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getAllStaticPages,
  getStaticPage,
  createStaticPage,
  updateStaticPage,
  deleteStaticPage,
} from '@/api'
import { SERVER_ERROR } from '../constants'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

describe('Static Page API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllStaticPages', () => {
    it('should fetch all static pages correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'about-us',
              key: 'about',
              title: 'About Us',
              content: 'About us content',
            },
            {
              slug: 'terms',
              key: 'terms',
              title: 'Terms of Service',
              content: 'Terms content',
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllStaticPages()
      expect(http.get).toHaveBeenCalledWith('/static-page')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getAllStaticPages()).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getStaticPage', () => {
    it('should fetch specific static page correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'about-us',
          key: 'about',
          title: 'About Us',
          content: 'About us content',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getStaticPage('about')
      expect(http.get).toHaveBeenCalledWith('/static-page/about')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle page not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Page not found' },
        },
      }
      ;(http.get as Mock).mockRejectedValue(mockError)
      await expect(getStaticPage('non-existent')).rejects.toEqual(mockError)
    })
  })

  describe('createStaticPage', () => {
    const pageData = {
      key: 'privacy',
      title: 'Privacy Policy',
      content: 'Privacy policy content',
    }

    it('should create static page correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'privacy-policy',
          ...pageData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createStaticPage(pageData)
      expect(http.post).toHaveBeenCalledWith('/static-page', pageData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle validation error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid page data' },
        },
      }
      ;(http.post as Mock).mockRejectedValue(mockError)
      await expect(createStaticPage(pageData)).rejects.toEqual(mockError)
    })
  })

  describe('updateStaticPage', () => {
    const updateData = {
      slug: 'about-us',
      key: 'about',
      title: 'Updated About Us',
      content: 'Updated content',
    }

    it('should update static page correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateStaticPage(updateData)
      expect(http.patch).toHaveBeenCalledWith(
        '/static-page/about-us',
        updateData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle page not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Page not found' },
        },
      }
      ;(http.patch as Mock).mockRejectedValue(mockError)
      await expect(updateStaticPage(updateData)).rejects.toEqual(mockError)
    })
  })

  describe('deleteStaticPage', () => {
    it('should delete static page correctly', async () => {
      const mockResponse = {
        data: null,
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteStaticPage('about-us')
      expect(http.delete).toHaveBeenCalledWith('/static-page/about-us')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle page not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Page not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteStaticPage('non-existent')).rejects.toEqual(mockError)
    })

    it('should handle server error during delete', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deleteStaticPage('about-us')).rejects.toEqual(SERVER_ERROR)
    })
  })
})
