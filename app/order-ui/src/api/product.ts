import { AxiosRequestConfig } from 'axios'
import { saveAs } from 'file-saver'

import { http } from '@/utils'
import {
  IApiResponse,
  ICreateProductRequest,
  IProduct,
  IUpdateProductRequest,
  ICreateProductVariantRequest,
  IUpdateProductVariantRequest,
  ITopProductQuery,
  ITopBranchProductQuery,
  IPaginationResponse,
  ITopProduct,
  IBranchTopProduct,
  IProductRequest,
} from '@/types'
import { useDownloadStore } from '@/stores'
import { useAuthStore } from '@/stores'

export async function getAllProducts(
  params?: IProductRequest,
): Promise<IApiResponse<IPaginationResponse<IProduct>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IProduct>>>(
    '/products',
    { params },
  )
  return response.data
}

export async function getProductBySlug(
  slug: string,
): Promise<IApiResponse<IProduct>> {
  const response = await http.get<IApiResponse<IProduct>>(`/products/${slug}`)
  return response.data
}

export async function createProduct(
  data: ICreateProductRequest,
): Promise<IApiResponse<IProduct>> {
  const response = await http.post<IApiResponse<IProduct>>('/products', data)
  return response.data
}

export async function uploadProductImage(
  slug: string,
  file: File,
): Promise<IApiResponse<IProduct>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await http.patch<IApiResponse<IProduct>>(
    `/products/${slug}/upload`,
    formData,
  )
  return response.data
}

export async function uploadMultipleProductImages(
  slug: string,
  files: File[],
): Promise<IApiResponse<IProduct>> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  const response = await http.patch<IApiResponse<IProduct>>(
    `/products/${slug}/uploads`,
    formData,
  )
  return response.data
}

export async function deleteProductImage(
  slug: string,
  image: string,
): Promise<IApiResponse<IProduct>> {
  const response = await http.delete<IApiResponse<IProduct>>(
    `/products/${slug}/images/${image}`,
  )
  return response.data
}

export async function updateProduct(
  data: IUpdateProductRequest,
): Promise<IApiResponse<IProduct>> {
  const response = await http.patch<IApiResponse<IProduct>>(
    `/products/${data.slug}`,
    data,
  )
  return response.data
}

export async function deleteProduct(
  slug: string,
): Promise<IApiResponse<IProduct>> {
  const response = await http.delete<IApiResponse<IProduct>>(
    `/products/${slug}`,
  )
  return response.data
}

export async function getAllProductVariant(): Promise<
  IApiResponse<IProduct[]>
> {
  const response = await http.get<IApiResponse<IProduct[]>>('/variants')
  return response.data
}

export async function createProductVariant(
  data: ICreateProductVariantRequest,
): Promise<IApiResponse<IProduct>> {
  const response = await http.post<IApiResponse<IProduct>>(`/variants`, data)
  return response.data
}

export async function updateProductVariant(
  data: IUpdateProductVariantRequest,
): Promise<IApiResponse<IProduct>> {
  const response = await http.patch<IApiResponse<IProduct>>(
    `/variants/${data.product}`,
    data,
  )
  return response.data
}

export async function deleteProductVariant(
  slug: string,
): Promise<IApiResponse<IProduct>> {
  const response = await http.delete<IApiResponse<IProduct>>(
    `/variants/${slug}`,
  )
  return response.data
}

export async function getTopProducts(
  params: ITopProductQuery,
): Promise<IApiResponse<IPaginationResponse<ITopProduct>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<ITopProduct>>
  >('/product-analysis/top-sell', {
    params,
  })
  return response.data
}

export async function getTopBranchProducts(
  params: ITopBranchProductQuery,
): Promise<IApiResponse<IPaginationResponse<IBranchTopProduct>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IBranchTopProduct>>
  >(`/product-analysis/top-sell/branch/${params.branch}`, {
    params,
  })
  return response.data
}
export async function exportAllProductsFile(): Promise<void> {
  const { setProgress, setIsDownloading, reset } = useDownloadStore.getState()
  const { token } = useAuthStore.getState()
  setIsDownloading(true)
  try {
    const config = {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          setProgress(percentCompleted)
        }
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig

    const response = await http.get('/products/export', config)
    const contentDisposition = response.headers['content-disposition']
    const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
    const fileName = fileNameMatch ? fileNameMatch[1] : 'all-products.xlsx'

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, fileName)
  } finally {
    setIsDownloading(false)
    reset()
  }
}

export async function getProductImportTemplate(): Promise<void> {
  const { setProgress, setIsDownloading, reset } = useDownloadStore.getState()
  const { token } = useAuthStore.getState()
  setIsDownloading(true)
  try {
    const config = {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          setProgress(percentCompleted)
        }
      },
      doNotShowLoading: true,
    } as AxiosRequestConfig

    const response = await http.get('/products/import-template', config)
    const contentDisposition = response.headers['content-disposition']
    const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
    const fileName = fileNameMatch
      ? fileNameMatch[1]
      : 'product-import-template.xlsx'

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, fileName)
  } finally {
    setIsDownloading(false)
    reset()
  }
}

export async function importProducts(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  await http.post('/products/multi', formData)
}
