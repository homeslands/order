import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  addNewOrderItem,
  createOrder,
  createOrderTracking,
  deleteOrder,
  deleteOrderItem,
  exportOrderInvoice,
  exportPaymentQRCode,
  getAllOrders,
  getOrderBySlug,
  getOrderInvoice,
  initiatePayment,
  updateOrderType,
} from '@/api'
import {
  ICreateOrderRequest,
  IInitiatePaymentRequest,
  ICreateOrderTrackingRequest,
  IGetOrderInvoiceRequest,
  IOrdersQuery,
  IAddNewOrderItemRequest,
  IUpdateOrderTypeRequest,
  IUpdateOrderItemRequest,
} from '@/types'
import { updateOrderItem } from '../api/order'

export const useOrders = (q: IOrdersQuery) => {
  return useQuery({
    queryKey: ['orders', q],
    queryFn: () => getAllOrders(q),
    placeholderData: keepPreviousData,
  })
}

export const useOrderBySlug = (
  slug: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['order', slug],
    queryFn: () => getOrderBySlug(slug),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  })
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: ICreateOrderRequest) => {
      return createOrder(data)
    },
  })
}

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: async (data: IInitiatePaymentRequest) => {
      return initiatePayment(data)
    },
  })
}

export const useCreateOrderTracking = () => {
  return useMutation({
    mutationFn: async (data: ICreateOrderTrackingRequest) => {
      return createOrderTracking(data)
    },
  })
}

export const useGetOrderInvoice = (params: IGetOrderInvoiceRequest) => {
  return useQuery({
    queryKey: ['order-invoice', params],
    queryFn: () => getOrderInvoice(params),
    placeholderData: keepPreviousData,
  })
}

export const useExportOrderInvoice = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return exportOrderInvoice(slug)
    },
  })
}

export const useExportPayment = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return exportPaymentQRCode(slug)
    },
  })
}

//Update order
export const useAddNewOrderItem = () => {
  return useMutation({
    mutationFn: async (data: IAddNewOrderItemRequest) => {
      return addNewOrderItem(data)
    },
  })
}

export const useUpdateOrderItem = () => {
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string, data: IUpdateOrderItemRequest }) => {
      return updateOrderItem(slug, data)
    },
  })
}

export const useDeleteOrderItem = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteOrderItem(slug)
    },
  })
}

//Update order type
export const useUpdateOrderType = () => {
  return useMutation({
    mutationFn: async ({
      slug,
      params,
    }: {
      slug: string
      params: IUpdateOrderTypeRequest
    }) => {
      return updateOrderType(slug, params)
    },
  })
}

//Delete order
export const useDeleteOrder = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteOrder(slug)
    },
  })
}
