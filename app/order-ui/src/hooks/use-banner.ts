import { useQuery, useMutation } from '@tanstack/react-query'

import {
  createBanner,
  deleteBanner,
  getBanners,
  getSpecificBanner,
  updateBanner,
} from '@/api'
import { QUERYKEY } from '@/constants'
import { ICreateBannerRequest, IUpdateBannerRequest } from '@/types'

export const useBanners = () => {
  return useQuery({
    queryKey: [QUERYKEY.banners],
    queryFn: async () => getBanners(),
  })
}

export const useCreateBanner = () => {
  return useMutation({
    mutationFn: async (data: ICreateBannerRequest) => {
      return createBanner(data)
    },
  })
}

export const useSpecificBanner = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY, slug],
    queryFn: async () => getSpecificBanner(slug),
  })
}

export const useUpdateBanner = () => {
  return useMutation({
    mutationFn: async (data: IUpdateBannerRequest) => {
      return updateBanner(data)
    },
  })
}

export const useDeleteBanner = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteBanner(slug)
    },
  })
}
