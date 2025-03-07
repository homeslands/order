import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadMultipleProductImages,
  deleteProductImage,
  getAllProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getTopProducts,
  getTopBranchProducts,
  exportAllProductsFile,
  getProductImportTemplate,
  importProducts,
} from '@/api'
import { SERVER_ERROR } from '../constants'
import { saveAs } from 'file-saver'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

// Mock the stores
vi.mock('@/stores', () => ({
  useDownloadStore: {
    getState: () => ({
      setProgress: vi.fn(),
      setIsDownloading: vi.fn(),
      reset: vi.fn(),
    }),
  },
  useAuthStore: {
    getState: () => ({
      token: 'mock-token',
    }),
  },
}))

// Add mock for file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

describe('Product API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllProducts', () => {
    it('should fetch all products correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'product-1',
              name: 'Test Product',
              description: 'Test Description',
              isActive: true,
              catalog: { slug: 'catalog-1' },
              variants: [],
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllProducts({ catalog: 'catalog-1' })
      expect(http.get).toHaveBeenCalledWith('/products', {
        params: { catalog: 'catalog-1' },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getAllProducts()).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getProductBySlug', () => {
    it('should fetch specific product correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'product-1',
          name: 'Test Product',
          description: 'Test Description',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getProductBySlug('product-1')
      expect(http.get).toHaveBeenCalledWith('/products/product-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle product not found error', async () => {
      const mockError = { response: { status: 404 } }
      ;(http.get as Mock).mockRejectedValue(mockError)
      await expect(getProductBySlug('non-existent')).rejects.toEqual(mockError)
    })
  })

  describe('createProduct', () => {
    const productData = {
      name: 'New Product',
      description: 'New Description',
      isLimit: false,
      isTopSell: true,
      isNew: true,
      catalog: 'catalog-1',
    }

    it('should create product correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'new-product',
          ...productData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createProduct(productData)
      expect(http.post).toHaveBeenCalledWith('/products', productData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('updateProduct', () => {
    const updateData = {
      slug: 'product-1',
      name: 'Updated Product',
      description: 'Updated Description',
      isLimit: false,
      isTopSell: true,
      isNew: true,
      catalog: 'catalog-1',
      isActive: true,
    }

    it('should update product correctly', async () => {
      const mockResponse = {
        data: {
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateProduct(updateData)
      expect(http.patch).toHaveBeenCalledWith('/products/product-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteProductImage', () => {
    it('should delete product image correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'product-1',
          images: [],
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteProductImage('product-1', 'image1.jpg')
      expect(http.delete).toHaveBeenCalledWith(
        '/products/product-1/images/image1.jpg',
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getAllProductVariant', () => {
    it('should fetch all product variants correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'variant-1',
              price: 100000,
              size: { name: 'Large' },
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllProductVariant()
      expect(http.get).toHaveBeenCalledWith('/variants')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createProductVariant', () => {
    const variantData = {
      price: 100000,
      size: 'size-1',
      product: 'product-1',
    }

    it('should create product variant correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'variant-1',
          ...variantData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createProductVariant(variantData)
      expect(http.post).toHaveBeenCalledWith('/variants', variantData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('updateProductVariant', () => {
    const updateData = {
      price: 150000,
      product: 'product-1',
    }

    it('should update product variant correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'variant-1',
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateProductVariant(updateData)
      expect(http.patch).toHaveBeenCalledWith('/variants/product-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteProductVariant', () => {
    it('should delete product variant correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'variant-1',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteProductVariant('variant-1')
      expect(http.delete).toHaveBeenCalledWith('/variants/variant-1')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getTopProducts', () => {
    const queryParams = {
      page: 1,
      size: 10,
      hasPaging: true,
    }

    it('should fetch top products correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'product-1',
              orderDate: '2024-01-01',
              totalQuantity: 100,
            },
          ],
          meta: {
            page: 1,
            total: 1,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getTopProducts(queryParams)
      expect(http.get).toHaveBeenCalledWith('/product-analysis/top-sell', {
        params: queryParams,
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getTopBranchProducts', () => {
    const queryParams = {
      branch: 'branch-1',
      page: 1,
      size: 10,
      hasPaging: true,
    }

    it('should fetch top branch products correctly', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              branch: { slug: 'branch-1' },
              product: { slug: 'product-1' },
              totalQuantity: 50,
            },
          ],
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getTopBranchProducts(queryParams)
      expect(http.get).toHaveBeenCalledWith(
        `/product-analysis/top-sell/branch/${queryParams.branch}`,
        { params: queryParams },
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('exportAllProductsFile', () => {
    it('should export products file correctly', async () => {
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-disposition': 'filename="products.xlsx"',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      await exportAllProductsFile()

      expect(http.get).toHaveBeenCalledWith('/products/export', {
        responseType: 'blob',
        headers: {
          Authorization: 'Bearer mock-token',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        onDownloadProgress: expect.any(Function),
        doNotShowLoading: true,
      })
      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'products.xlsx')
    })

    it('should handle export error', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(exportAllProductsFile()).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('getProductImportTemplate', () => {
    it('should download import template correctly', async () => {
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-disposition': 'filename="template.xlsx"',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      await getProductImportTemplate()

      expect(http.get).toHaveBeenCalledWith('/products/import-template', {
        responseType: 'blob',
        headers: {
          Authorization: 'Bearer mock-token',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        onDownloadProgress: expect.any(Function),
        doNotShowLoading: true,
      })
      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'template.xlsx')
    })
  })

  describe('importProducts', () => {
    it('should import products correctly', async () => {
      const mockFile = new File(['test'], 'products.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const mockResponse = { data: { message: 'Import successful' } }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      await importProducts(mockFile)
      expect(http.post).toHaveBeenCalledWith(
        '/products/multi',
        expect.any(FormData),
      )
    })

    it('should handle import error', async () => {
      const mockFile = new File(['test'], 'products.xlsx')
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(importProducts(mockFile)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('uploadProductImage', () => {
    it('should upload product image correctly', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = {
        data: {
          slug: 'product-1',
          image: 'new-image-url',
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await uploadProductImage('product-1', mockFile)
      expect(http.patch).toHaveBeenCalledWith(
        '/products/product-1/upload',
        expect.any(FormData),
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('uploadMultipleProductImages', () => {
    it('should upload multiple product images correctly', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]
      const mockResponse = {
        data: {
          slug: 'product-1',
          images: ['url1', 'url2'],
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await uploadMultipleProductImages('product-1', mockFiles)
      expect(http.patch).toHaveBeenCalledWith(
        '/products/product-1/uploads',
        expect.any(FormData),
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteProduct', () => {
    it('should delete product correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'product-1',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteProduct('product-1')
      expect(http.delete).toHaveBeenCalledWith('/products/product-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle product not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Product not found' },
        },
      }
      ;(http.delete as Mock).mockRejectedValue(mockError)
      await expect(deleteProduct('non-existent')).rejects.toEqual(mockError)
    })

    it('should handle server error during delete', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deleteProduct('product-1')).rejects.toEqual(SERVER_ERROR)
    })
  })
})
