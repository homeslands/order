import { http } from '@/utils'
import {
  IApiResponse,
  ICreateStaticPage,
  IStaticPage,
  IUpdateStaticPage,
} from '@/types'

export async function getAllStaticPages(): Promise<
  IApiResponse<IStaticPage[]>
> {
  const response = await http.get<IApiResponse<IStaticPage[]>>('/static-page')
  return response.data
}

export async function getStaticPage(
  key: string,
): Promise<IApiResponse<IStaticPage>> {
  const response = await http.get<IApiResponse<IStaticPage>>(
    `/static-page/${key}`,
  )
  return response.data
}

export async function createStaticPage(
  data: ICreateStaticPage,
): Promise<IApiResponse<IStaticPage>> {
  const response = await http.post<IApiResponse<IStaticPage>>(
    '/static-page',
    data,
  )
  return response.data
}

export async function updateStaticPage(
  data: IUpdateStaticPage,
): Promise<IApiResponse<IStaticPage>> {
  const response = await http.patch<IApiResponse<IStaticPage>>(
    `/static-page/${data.slug}`,
    data,
  )
  return response.data
}

export async function deleteStaticPage(
  slug: string,
): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(`/static-page/${slug}`)
  return response.data
}
