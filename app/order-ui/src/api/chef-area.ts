import { useDownloadStore } from '@/stores'
import {
  IApiResponse,
  IChefArea,
  IChefAreaProduct,
  IChefOrders,
  IChefSpecificOrder,
  ICreateChefAreaProductRequest,
  ICreateChefAreaRequest,
  ICreateChefOrderRequest,
  IGetChefOrderRequest,
  IPaginationResponse,
  IUpdateChefAreaProductRequest,
  IUpdateChefAreaRequest,
  IUpdateChefOrderItemStatusRequest,
  IUpdateChefOrderStatusRequest,
} from '@/types'
import { http } from '@/utils'

export async function getChefAreas(
  branch: string,
): Promise<IApiResponse<IChefArea[]>> {
  const response = await http.get<IApiResponse<IChefArea[]>>(`/chef-area/`, {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
    params: { branch },
  })
  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

export async function createChefArea(
  data: ICreateChefAreaRequest,
): Promise<IApiResponse<IChefArea>> {
  const response = await http.post('/chef-area', data)
  return response.data
}

export async function getChefAreaBySlug(
  slug: string,
): Promise<IApiResponse<IChefArea>> {
  const response = await http.get(`/chef-area/specific/${slug}`)
  return response.data
}

export async function updateChefArea(
  data: IUpdateChefAreaRequest,
): Promise<IApiResponse<IChefArea>> {
  const response = await http.patch(`/chef-area/${data.slug}`, data)
  return response.data
}

export async function deleteChefArea(slug: string): Promise<void> {
  await http.delete(`/chef-area/${slug}`)
}

export async function exportChefOrder(slug: string): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()
  const currentDate = new Date().toISOString()
  setFileName(`TRENDCoffee-${currentDate}.pdf`)
  setIsDownloading(true)
  try {
    const response = await http.get(`/chef-order/${slug}/export`, {
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
    })
    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}

export async function getAllChefAreaProducts(
  chefArea: string,
): Promise<IApiResponse<IChefAreaProduct[]>> {
  const response = await http.get(`/product-chef-area`, {
    params: { chefArea },
  })
  return response.data
}

export async function getChefAreaSpecificProduct(
  chefAreaProduct: string,
): Promise<IApiResponse<IChefAreaProduct[]>> {
  const response = await http.get(
    `/product-chef-area/specific/${chefAreaProduct}`,
  )
  return response.data
}

export async function addProductToChefArea(
  data: ICreateChefAreaProductRequest,
): Promise<IApiResponse<IChefAreaProduct>> {
  const response = await http.post('/product-chef-area', { data })
  return response.data
}

export async function addMultipleProductsToChefArea(
  data: ICreateChefAreaProductRequest,
): Promise<IApiResponse<IChefAreaProduct[]>> {
  const response = await http.post('/product-chef-area/multi', data)
  return response.data
}

export async function updateProductInChefArea(
  data: IUpdateChefAreaProductRequest,
): Promise<IApiResponse<IChefAreaProduct>> {
  const response = await http.patch(
    `/product-chef-area/${data.chefAreaProduct}`,
    data,
  )
  return response.data
}

export async function removeProductFromChefArea(
  chefAreaProduct: string,
): Promise<void> {
  await http.delete(`/product-chef-area/${chefAreaProduct}`)
}

export async function getChefOrders(
  data: IGetChefOrderRequest,
): Promise<IApiResponse<IPaginationResponse<IChefOrders>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IChefOrders>>
  >(`/chef-order`, {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
    params: data,
  })
  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

export async function getSpecificChefOrder(
  slug: string,
): Promise<IApiResponse<IChefSpecificOrder>> {
  const response = await http.get(`/chef-order/specific/${slug}`, {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
  })
  return response.data
}

export async function createChefOrder(
  data: ICreateChefOrderRequest,
): Promise<IApiResponse<IChefOrders>> {
  const response = await http.post('/chef-order', data)
  return response.data
}

export async function updateChefOrderStatus(
  params: IUpdateChefOrderStatusRequest,
): Promise<IApiResponse<IChefOrders>> {
  const response = await http.patch(`/chef-order/${params.slug}`, {
    status: params.status,
  })
  return response.data
}

export async function updateChefOrderItemStatus(
  params: IUpdateChefOrderItemStatusRequest,
): Promise<IApiResponse<IChefOrders>> {
  const response = await http.patch(`/chef-order-item/${params.slug}`, {
    status: params.status,
  })
  return response.data
}

export async function exportManualChefOrderTicket(slug: string): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()
  const currentDate = new Date().toISOString()
  setFileName(`TRENDCoffee-invoice-${currentDate}.pdf`)
  setIsDownloading(true)
  try {
    const response = await http.get(
      `/chef-order/${slug}/export-manual/tickets`,
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
        // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
        doNotShowLoading: true,
      },
    )
    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}

export async function exportAutoChefOrderTicket(slug: string): Promise<Blob> {
  const { setProgress, setFileName, setIsDownloading, reset } =
    useDownloadStore.getState()
  const currentDate = new Date().toISOString()
  setFileName(`TRENDCoffee-invoice-${currentDate}.pdf`)
  setIsDownloading(true)
  try {
    const response = await http.get(`/chef-order/${slug}/export-auto/tickets`, {
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
      // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
      doNotShowLoading: true,
    })
    return response.data
  } finally {
    setIsDownloading(false)
    reset()
  }
}
