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
} from '@/types'

export async function getAllProducts(): Promise<IApiResponse<IProduct[]>> {
  const response = await http.get<IApiResponse<IProduct[]>>('/products')
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
