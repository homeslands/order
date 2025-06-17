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
  createOrderWithoutLogin,
  deleteOrderWithoutLogin,
  exportPublicOrderInvoice,
  getAllOrdersPublic,
  getAllOrderWithoutLogin,
  getPublicOrderInvoice,
  initiatePublicPayment,
  updateNoteOrderItem,
  updateOrderItem,
  updateVoucherInOrder,
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
  IUpdateNoteRequest,
  IOrderItemsParam,
} from '@/types'

export const useOrders = (q: IOrdersQuery) => {
  return useQuery({
    queryKey: ['orders', q],
    queryFn: () => getAllOrders(q),
    placeholderData: keepPreviousData,
  })
}

export const useOrdersPublic = () => {
  return useQuery({
    queryKey: ['orders-public'],
    queryFn: () => getAllOrdersPublic(),
    placeholderData: keepPreviousData,
  })
}

export const useOrderBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['order', slug],
    queryFn: () => getOrderBySlug(slug),
    placeholderData: keepPreviousData,
    enabled: !!slug,
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

export const useInitiatePublicPayment = () => {
  return useMutation({
    mutationFn: async (data: IInitiatePaymentRequest) => {
      return initiatePublicPayment(data)
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

export const useGetPublicOrderInvoice = (order: string) => {
  return useQuery({
    queryKey: ['public-order-invoice', order],
    queryFn: () => getPublicOrderInvoice(order),
  })
}

export const useExportOrderInvoice = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return exportOrderInvoice(slug)
    },
  })
}

export const useExportPublicOrderInvoice = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return exportPublicOrderInvoice(slug)
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
    mutationFn: async ({
      slug,
      data,
    }: {
      slug: string
      data: IUpdateOrderItemRequest
    }) => {
      return updateOrderItem(slug, data)
    },
  })
}

export const useUpdateNoteOrderItem = () => {
  return useMutation({
    mutationFn: async ({
      slug,
      data,
    }: {
      slug: string
      data: IUpdateNoteRequest
    }) => {
      return updateNoteOrderItem(slug, data)
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

// update voucher
export const useUpdateVoucherInOrder = () => {
  return useMutation({
    mutationFn: async ({
      slug,
      voucher,
      orderItems,
    }: {
      slug: string
      voucher: string | null
      orderItems: IOrderItemsParam[]
    }) => {
      return updateVoucherInOrder(slug, voucher, orderItems)
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

export const useDeletePublicOrder = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteOrderWithoutLogin(slug)
    },
  })
}

// order without login
export const useCreateOrderWithoutLogin = () => {
  return useMutation({
    mutationFn: async (data: ICreateOrderRequest) => {
      return createOrderWithoutLogin(data)
    },
  })
}

export const useGetAllOrderWithoutLogin = () => {
  return useQuery({
    queryKey: ['orders-without-login'],
    queryFn: () => getAllOrderWithoutLogin(),
  })
}
