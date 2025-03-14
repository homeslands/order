import { http } from '@/utils'
import {
  IApiResponse,
  IBanner,
  IBannerRequest,
  ICreateBannerRequest,
  IUpdateBannerRequest,
} from '@/types'

export async function getBanners(params?: IBannerRequest): Promise<IApiResponse<IBanner[]>> {
  const response = await http.get<IApiResponse<IBanner[]>>(`/banner`, { params })
  return response.data
}

export async function getSpecificBanner(
  slug: string,
): Promise<IApiResponse<IBanner>> {
  const response = await http.get<IApiResponse<IBanner>>(`/banner/${slug}`)
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function createBanner(
  params: ICreateBannerRequest,
): Promise<IApiResponse<IBanner>> {
  const response = await http.post<IApiResponse<IBanner>>('/banner', params)
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function updateBanner(
  params: IUpdateBannerRequest,
): Promise<IApiResponse<IBanner>> {
  const response = await http.patch<IApiResponse<IBanner>>(
    `/banner/${params.slug}`,
    params,
  )
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function uploadBannerImage(
  slug: string,
  file: File,
): Promise<IApiResponse<IBanner>> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await http.patch<IApiResponse<IBanner>>(
    `/banner/${slug}/upload`,
    formData,
  )
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function deleteBanner(
  slug: string,
): Promise<IApiResponse<IBanner>> {
  const response = await http.delete<IApiResponse<IBanner>>(`/banner/${slug}`)
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}
