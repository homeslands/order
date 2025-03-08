import { httpMock } from '../__mocks__/httpMock'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { http } from '@/utils'
import {
  getAllOrders,
  getOrderBySlug,
  createOrder,
  initiatePayment,
  exportPaymentQRCode,
  createOrderTracking,
  getOrderInvoice,
  exportOrderInvoice,
  addNewOrderItem,
  deleteOrderItem,
  updateOrderType,
  deleteOrder,
} from '@/api'
import { SERVER_ERROR } from '../constants'
import { OrderTypeEnum } from '@/types'

vi.mock('@/utils', () => ({
  http: httpMock,
}))

// Mock the download store
vi.mock('@/stores', () => ({
  useDownloadStore: {
    getState: () => ({
      setProgress: vi.fn(),
      setFileName: vi.fn(),
      setIsDownloading: vi.fn(),
      reset: vi.fn(),
    }),
  },
}))

describe('Order API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllOrders', () => {
    const queryParams = {
      page: 1,
      size: 10,
      order: 'DESC' as const,
      branchSlug: 'test-branch',
    }

    it('should fetch all orders with correct parameters', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              slug: 'order-1',
              type: OrderTypeEnum.AT_TABLE,
              status: 'pending',
              orderItems: [],
            },
          ],
          meta: {
            page: 1,
            total: 1,
            totalPages: 1,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getAllOrders(queryParams)
      expect(http.get).toHaveBeenCalledWith('/orders', {
        doNotShowLoading: true,
        params: queryParams,
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getOrderBySlug', () => {
    it('should fetch specific order with correct slug', async () => {
      const mockResponse = {
        data: {
          slug: 'order-1',
          type: OrderTypeEnum.AT_TABLE,
          status: 'pending',
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getOrderBySlug('order-1')
      expect(http.get).toHaveBeenCalledWith('/orders/order-1', {
        doNotShowLoading: true,
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('createOrder', () => {
    const orderData = {
      type: OrderTypeEnum.AT_TABLE,
      table: 'table-1',
      branch: 'branch-1',
      owner: 'owner-1',
      orderItems: [
        {
          quantity: 1,
          variant: 'variant-1',
          note: 'test note',
        },
      ],
      approvalBy: 'user-1',
      voucher: null,
    }

    it('should create order with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'new-order',
          ...orderData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createOrder(orderData)
      expect(http.post).toHaveBeenCalledWith('/orders', orderData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('initiatePayment', () => {
    const paymentData = {
      paymentMethod: 'VNPAY',
      orderSlug: 'order-1',
    }

    it('should initiate payment with correct data', async () => {
      const mockResponse = {
        data: {
          qrCode: 'qr-code-data',
          requestTrace: 'trace-id',
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await initiatePayment(paymentData)
      expect(http.post).toHaveBeenCalledWith('/payment/initiate', paymentData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('exportPaymentQRCode', () => {
    it('should export payment QR code correctly', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' })
      const mockResponse = { data: mockBlob }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await exportPaymentQRCode('order-1')
      expect(http.post).toHaveBeenCalledWith('payment/order-1/export', null, {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
        onDownloadProgress: expect.any(Function),
        doNotShowLoading: true,
      })
      expect(result).toEqual(mockBlob)
    })

    it('should handle server error during QR code export', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(exportPaymentQRCode('order-1')).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('createOrderTracking', () => {
    const trackingData = {
      type: 'COOKING',
      trackingOrderItems: [{ quantity: 1, orderItem: 'item-1' }],
    }

    it('should create order tracking with correct data', async () => {
      const mockResponse = {
        data: {
          slug: 'tracking-1',
          status: 'PENDING',
          ...trackingData,
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await createOrderTracking(trackingData)
      expect(http.post).toHaveBeenCalledWith('/trackings', trackingData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error during tracking creation', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(createOrderTracking(trackingData)).rejects.toEqual(
        SERVER_ERROR,
      )
    })
  })

  describe('getOrderInvoice', () => {
    const invoiceParams = {
      order: 'order-1',
      slug: 'invoice-1',
    }

    it('should get order invoice with correct parameters', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              paymentMethod: 'VNPAY',
              amount: 100000,
              status: 'COMPLETED',
              invoiceItems: [],
            },
          ],
          meta: {
            page: 1,
            total: 1,
          },
        },
      }
      ;(http.get as Mock).mockResolvedValue(mockResponse)

      const result = await getOrderInvoice(invoiceParams)
      expect(http.get).toHaveBeenCalledWith('/invoice/specific', {
        params: invoiceParams,
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error when getting invoice', async () => {
      ;(http.get as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(getOrderInvoice(invoiceParams)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('exportOrderInvoice', () => {
    it('should export order invoice correctly', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' })
      const mockResponse = { data: mockBlob }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await exportOrderInvoice('order-1')
      expect(http.post).toHaveBeenCalledWith(
        '/invoice/export',
        { order: 'order-1' },
        {
          responseType: 'blob',
          headers: {
            Accept: 'application/pdf',
          },
          onDownloadProgress: expect.any(Function),
          doNotShowLoading: true,
        },
      )
      expect(result).toEqual(mockBlob)
    })

    it('should handle server error during invoice export', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(exportOrderInvoice('order-1')).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('addNewOrderItem', () => {
    const newItemData = {
      quantity: 2,
      variant: 'variant-1',
      note: 'Extra spicy',
      promotion: 'promo-1',
      order: 'order-1',
    }

    it('should add new order item correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'order-1',
          orderItems: [{ ...newItemData }],
        },
      }
      ;(http.post as Mock).mockResolvedValue(mockResponse)

      const result = await addNewOrderItem(newItemData)
      expect(http.post).toHaveBeenCalledWith('/order-items', newItemData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error when adding item', async () => {
      ;(http.post as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(addNewOrderItem(newItemData)).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('deleteOrderItem', () => {
    it('should delete order item correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'order-1',
          orderItems: [],
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteOrderItem('item-1')
      expect(http.delete).toHaveBeenCalledWith('/order-items/item-1')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle server error when deleting item', async () => {
      ;(http.delete as Mock).mockRejectedValue(SERVER_ERROR)
      await expect(deleteOrderItem('item-1')).rejects.toEqual(SERVER_ERROR)
    })
  })

  describe('updateOrderType', () => {
    const updateData = {
      type: OrderTypeEnum.TAKE_OUT,
      table: null,
    }

    it('should update order type correctly', async () => {
      const mockResponse = {
        data: {
          slug: 'order-1',
          ...updateData,
        },
      }
      ;(http.patch as Mock).mockResolvedValue(mockResponse)

      const result = await updateOrderType('order-1', updateData)
      expect(http.patch).toHaveBeenCalledWith('/orders/order-1', updateData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteOrder', () => {
    it('should delete order with correct slug', async () => {
      const mockResponse = {
        data: {
          slug: 'order-1',
          status: 'deleted',
        },
      }
      ;(http.delete as Mock).mockResolvedValue(mockResponse)

      const result = await deleteOrder('order-1')
      expect(http.delete).toHaveBeenCalledWith('/orders/order-1')
      expect(result).toEqual(mockResponse.data)
    })
  })
})
