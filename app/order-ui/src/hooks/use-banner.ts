import { useQuery, useMutation } from '@tanstack/react-query'

import {
  createBanner,
  deleteBanner,
  getBanners,
  getSpecificBanner,
  updateBanner,
  uploadBannerImage,
} from '@/api'
import { QUERYKEY } from '@/constants'
import { IBannerRequest, ICreateBannerRequest, IUpdateBannerRequest } from '@/types'

export const useBanners = (params?: IBannerRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.banners, params],
    queryFn: async () => getBanners(params),
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

export const useUploadBannerImage = () => {
  return useMutation({
    mutationFn: async ({ slug, file }: { slug: string; file: File }) => {
      return uploadBannerImage(slug, file)
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
