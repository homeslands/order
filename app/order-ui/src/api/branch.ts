import { http } from '@/utils'
import {
  IApiResponse,
  ICreateBranchRequest,
  IBranch,
  IUpdateBranchRequest,
} from '@/types'

export async function getAllBranches(): Promise<IApiResponse<IBranch[]>> {
  const response = await http.get<IApiResponse<IBranch[]>>('/branch')
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function createBranch(
  params: ICreateBranchRequest,
): Promise<IApiResponse<IBranch>> {
  const response = await http.post<IApiResponse<IBranch>>('/branch', params)
  if (!response || !response.data) throw new Error('No data found')
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function updateBranch(
  data: IUpdateBranchRequest,
): Promise<IApiResponse<IBranch>> {
  const response = await http.patch<IApiResponse<IBranch>>(
    `/branch/${data.slug}`,
    data,
  )
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}

export async function deleteBranch(slug: string): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(`/branch/${slug}`)

  if (!response || !('data' in response)) {
    throw new Error('No data found')
  }

  return response.data
}
