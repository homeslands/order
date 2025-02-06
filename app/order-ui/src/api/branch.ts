import { http } from '@/utils'
import {
  IApiResponse,
  ICreateBranchRequest,
  IBranch,
  IUpdateBranchRequest,
} from '@/types'

export async function getAllBranches(): Promise<IApiResponse<IBranch[]>> {
  const response = await http.get<IApiResponse<IBranch[]>>('/branch')
  return response.data
}

export async function createBranch(
  params: ICreateBranchRequest,
): Promise<IApiResponse<IBranch>> {
  const response = await http.post<IApiResponse<IBranch>>('/branch', params)
  return response.data
}

export async function updateBranch(
  data: IUpdateBranchRequest,
): Promise<IApiResponse<IBranch>> {
  const response = await http.patch<IApiResponse<IBranch>>(
    `/branch/${data.slug}`,
    data,
  )
  return response.data
}

export async function deleteBranch(slug: string): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(`/branch/${slug}`)
  return response.data
}
