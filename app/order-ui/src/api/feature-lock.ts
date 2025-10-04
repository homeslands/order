import { IApiResponse, IFeatureLock, IFeatureLockGroup } from '@/types'
import { http } from '@/utils'

export async function updateMultipleParentFeatureFlags(
  updates: { slug: string; isLocked: boolean }[],
): Promise<IApiResponse<IFeatureLockGroup>> {
  const response = await http.patch(`/feature-flag-system/bulk-toggle`, {
    updates,
  })
  return response.data
}

export async function updateMultipleChildFeatureFlags(
  updates: { slug: string; isLocked: boolean }[],
): Promise<IApiResponse<IFeatureLockGroup>> {
  const response = await http.patch(`/feature-flag-system/child/bulk-toggle`, {
    updates,
  })
  return response.data
}

export async function getSystemFeatureFlagGroups(): Promise<
  IApiResponse<IFeatureLockGroup[]>
> {
  const response = await http.get<IApiResponse<IFeatureLockGroup[]>>(
    `/feature-flag-system/group`,
  )
  return response.data
}

export async function getSystemFeatureFlagsByGroup(
  groupName: string,
): Promise<IApiResponse<IFeatureLock[]>> {
  const response = await http.get<IApiResponse<IFeatureLock[]>>(
    `/feature-flag-system/group/${groupName}`,
  )
  return response.data
}
