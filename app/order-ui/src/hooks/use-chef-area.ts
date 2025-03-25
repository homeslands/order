import {
  addProductToChefArea,
  createChefArea,
  deleteChefArea,
  getAllChefAreaProducts,
  getChefAreaBySlug,
  getChefAreas,
  getChefAreaSpecificProduct,
  removeProductFromChefArea,
  updateChefArea,
  updateProductInChefArea,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  ICreateChefAreaProductRequest,
  ICreateChefAreaRequest,
  IUpdateChefAreaProductRequest,
  IUpdateChefAreaRequest,
} from '@/types'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

export const useGetChefAreas = (branch: string) => {
  return useQuery({
    queryKey: [QUERYKEY.chefAreas, branch],
    queryFn: () => getChefAreas(branch),
    placeholderData: keepPreviousData,
  })
}

export const useGetChefAreaBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.chefAreas, { slug }],
    queryFn: () => getChefAreaBySlug(slug),
  })
}

export const useCreateChefArea = () => {
  return useMutation({
    mutationFn: async (data: ICreateChefAreaRequest) => {
      return createChefArea(data)
    },
  })
}

export const useUpdateChefArea = () => {
  return useMutation({
    mutationFn: async (data: IUpdateChefAreaRequest) => {
      return updateChefArea(data)
    },
  })
}

export const useDeleteChefArea = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteChefArea(slug)
    },
  })
}

export const useGetChefAreaProducts = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.chefAreaProducts, slug],
    queryFn: () => getAllChefAreaProducts(slug),
    placeholderData: keepPreviousData,
  })
}

export const useGetSpecificChefAreaProduct = (chefAreaProduct: string) => {
  return useQuery({
    queryKey: [QUERYKEY.chefAreaProducts, { chefAreaProduct }],
    queryFn: () => getChefAreaSpecificProduct(chefAreaProduct),
  })
}

export const useAddChefAreaProduct = () => {
  return useMutation({
    mutationFn: async (data: ICreateChefAreaProductRequest) => {
      return addProductToChefArea(data)
    },
  })
}

export const useUpdateChefAreaProduct = () => {
  return useMutation({
    mutationFn: async (data: IUpdateChefAreaProductRequest) => {
      return updateProductInChefArea(data)
    },
  })
}

export const useRemoveChefAreaProduct = () => {
  return useMutation({
    mutationFn: async (chefAreaProduct: string) => {
      return removeProductFromChefArea(chefAreaProduct)
    },
  })
}
