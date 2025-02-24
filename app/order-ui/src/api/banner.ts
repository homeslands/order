import { http } from '@/utils'
import {
  IApiResponse,
  IBanner,
  ICreateBannerRequest,
  IUpdateBannerRequest,
} from '@/types'

export async function getBanners(): Promise<IApiResponse<IBanner[]>> {
  const response = await http.get<IApiResponse<IBanner[]>>('/banner')
  return response.data
}

export async function getSpecificBanner(
  slug: string,
): Promise<IApiResponse<IBanner>> {
  const response = await http.get<IApiResponse<IBanner>>(`/banner/${slug}`)
  return response.data
}

export async function createBanner(
  params: ICreateBannerRequest,
): Promise<IApiResponse<IBanner>> {
  const response = await http.post<IApiResponse<IBanner>>('/banner', params)
  return response.data
}

export async function updateBanner(
  params: IUpdateBannerRequest,
): Promise<IApiResponse<IBanner>> {
  const response = await http.patch<IApiResponse<IBanner>>(
    `/banner/${params.slug}`,
    params,
  )
  return response.data
}

export async function deleteBanner(
  slug: string,
): Promise<IApiResponse<IBanner>> {
  const response = await http.delete<IApiResponse<IBanner>>(`/banner/${slug}`)
  return response.data
}
