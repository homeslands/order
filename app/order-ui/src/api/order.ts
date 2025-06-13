import { AxiosRequestConfig } from 'axios'
import moment from 'moment'

import { http } from '@/utils'
import {
  IApiResponse,
  IOrder,
  ICreateOrderRequest,
  IInitiatePaymentRequest,
  ICreateOrderResponse,
  IPayment,
  ICreateOrderTrackingRequest,
  IOrderTracking,
  IOrderInvoice,
  IGetOrderInvoiceRequest,
  IPaginationResponse,
  IOrdersQuery,
  IAddNewOrderItemRequest,
  IUpdateOrderTypeRequest,
  IUpdateOrderItemRequest,
  IUpdateNoteRequest,
  IOrderItemsParam,
} from '@/types'
import { useDownloadStore } from '@/stores'

export async function getAllOrders(
  params: IOrdersQuery,
): Promise<IApiResponse<IPaginationResponse<IOrder>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IOrder>>>(
    '/orders',
    {
      // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
      doNotShowLoading: true,
      params,
    },
  )
  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

// public order
export async function getAllOrdersPublic(): Promise<IApiResponse<IOrder[]>> {
  const response = await http.get<IApiResponse<IOrder[]>>('/orders/public', {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
  })
  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

export async function getOrderBySlug(
  slug: string,
): Promise<IApiResponse<IOrder>> {
  const response = await http.get<IApiResponse<IOrder>>(`/orders/${slug}`, {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
  })
  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

export async function createOrder(
  params: ICreateOrderRequest,
): Promise<IApiResponse<ICreateOrderResponse>> {
  const response = await http.post<IApiResponse<ICreateOrderResponse>>(
    '/orders',
    params,
  )
  return response.data
}

export async function initiatePayment(
  params: IInitiatePaymentRequest,
): Promise<IApiResponse<IPayment>> {
  const response = await http.post<IApiResponse<IPayment>>(
    `/payment/initiate`,
    params,
  )
  return response.data
}

// public payment
export async function initiatePublicPayment(
  params: IInitiatePaymentRequest,
): Promise<IApiResponse<IPayment>> {
  const response = await http.post<IApiResponse<IPayment>>(
    `/payment/initiate/public`,
    params,
  )
  return response.data
}

export async function exportPaymentQRCode(slug: string): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()
  const currentDate = new Date().toISOString()
  setFileName(`TRENDCoffee-${currentDate}.pdf`)
  setIsDownloading(true)
  try {
    const response = await http.post(`payment/${slug}/export`, null, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        )
        setProgress(percentCompleted)
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig)
    // const blob = new Blob([response.data], { type: 'application/pdf' })
    // saveAs(blob, `TREND Coffee QR Code-${currentDate}.pdf`)
    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}

export async function createOrderTracking(
  params: ICreateOrderTrackingRequest,
): Promise<IApiResponse<IOrderTracking>> {
  const response = await http.post<IApiResponse<IOrderTracking>>(
    `/trackings`,
    params,
  )
  return response.data
}

export async function getOrderInvoice(
  params: IGetOrderInvoiceRequest,
): Promise<IApiResponse<IPaginationResponse<IOrderInvoice>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IOrderInvoice>>
  >('/invoice/specific', {
    params,
  })
  return response.data
}

// public order invoice
export async function getPublicOrderInvoice(order: string): Promise<Blob> {
  const response = await http.get(`/invoice/specific/public`, {
    params: { order },
    responseType: 'blob',
  })
  return response.data
}

export async function exportOrderInvoice(order: string): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()
  const currentDate = moment(new Date()).toISOString()
  setFileName(`Invoice-${currentDate}.pdf`)
  setIsDownloading(true)
  try {
    const response = await http.post(
      `/invoice/export`, // Đổi từ GET sang POST
      { order }, // Truyền slug trong payload
      {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
          )
          setProgress(percentCompleted)
        },
        doNotShowLoading: true,
      } as AxiosRequestConfig,
    )
    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}

// public order invoice
export async function exportPublicOrderInvoice(order: string): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()
  const currentDate = new Date().toISOString()
  setFileName(`TRENDCoffee-invoice-${currentDate}.pdf`)
  setIsDownloading(true)
  try {
    const response = await http.post(`/invoice/export/public`, { order }, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        )
        setProgress(percentCompleted)
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig)

    // create a url for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `TRENDCoffee-invoice-${currentDate}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}

//Update order
export async function addNewOrderItem(
  params: IAddNewOrderItemRequest,
): Promise<IApiResponse<IOrder>> {
  const response = await http.post<IApiResponse<IOrder>>(`/order-items`, params)
  return response.data
}

export async function deleteOrderItem(
  slug: string,
): Promise<IApiResponse<IOrder>> {
  const response = await http.delete<IApiResponse<IOrder>>(
    `/order-items/${slug}`,
  )
  return response.data
}

// update voucher
export async function updateVoucherInOrder(
  slug: string,
  voucher: string | null, // voucher: null for remove voucher
  orderItems: IOrderItemsParam[],
): Promise<IApiResponse<IOrder>> {
  const response = await http.patch<IApiResponse<IOrder>>(
    `/orders/${slug}/voucher`,
    { voucher, orderItems },
  )
  return response.data
}

export async function updateOrderType(
  slug: string,
  params: IUpdateOrderTypeRequest,
): Promise<IApiResponse<IOrder>> {
  const response = await http.patch<IApiResponse<IOrder>>(
    `/orders/${slug}`,
    params,
  )
  return response.data
}
export async function updateOrderItem(
  slug: string,
  data: IUpdateOrderItemRequest,
): Promise<IApiResponse<IOrder>> {
  const response = await http.patch<IApiResponse<IOrder>>(
    `/order-items/${slug}`,
    data,
  )
  return response.data
}
export async function updateNoteOrderItem(
  slug: string,
  data: IUpdateNoteRequest,
): Promise<IApiResponse<IOrder>> {
  const response = await http.patch<IApiResponse<IOrder>>(
    `/order-items/${slug}/note`,
    data,
  )
  return response.data
}

export async function deleteOrder(slug: string): Promise<IApiResponse<IOrder>> {
  const response = await http.delete<IApiResponse<IOrder>>(`/orders/${slug}`)
  return response.data
}

// order without login
export async function createOrderWithoutLogin(
  params: ICreateOrderRequest,
): Promise<IApiResponse<ICreateOrderResponse>> {
  const response = await http.post<IApiResponse<ICreateOrderResponse>>(
    '/orders/public',
    params,
  )
  return response.data
}

// get all order without login
export async function getAllOrderWithoutLogin(): Promise<
  IApiResponse<IOrder[]>
> {
  const response = await http.get<IApiResponse<IOrder[]>>(`/orders/public`)
  return response.data
}

// delete order without login
export async function deleteOrderWithoutLogin(
  slug: string,
): Promise<IApiResponse<IOrder>> {
  const response = await http.delete<IApiResponse<IOrder>>(
    `/orders/${slug}/public`,
  )
  return response.data
}
