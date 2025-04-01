import {
  addMultipleProductsToChefArea,
  addProductToChefArea,
  createChefArea,
  deleteChefArea,
  getAllChefAreaProducts,
  getChefAreaBySlug,
  getChefAreas,
  getChefAreaSpecificProduct,
  getChefOrders,
  getSpecificChefOrder,
  removeProductFromChefArea,
  updateChefArea,
  updateChefOrderItemStatus,
  updateChefOrderStatus,
  updateProductInChefArea,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  ICreateChefAreaProductRequest,
  ICreateChefAreaRequest,
  IGetChefOrderRequest,
  IUpdateChefAreaProductRequest,
  IUpdateChefAreaRequest,
  IUpdateChefOrderItemStatusRequest,
  IUpdateChefOrderStatusRequest,
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

export const useAddMultipleChefAreaProduct = () => {
  return useMutation({
    mutationFn: async (data: ICreateChefAreaProductRequest) => {
      return addMultipleProductsToChefArea(data)
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

export const useGetChefOrders = (params: IGetChefOrderRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.chefOrders, params],
    queryFn: () => getChefOrders(params),
  })
}

export const useGetSpecificChefOrder = (
  slug: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [QUERYKEY.chefOrders, { slug }],
    queryFn: () => getSpecificChefOrder(slug),
    enabled: options?.enabled,
  })
}

export const useUpdateChefOrderStatus = () => {
  return useMutation({
    mutationFn: async (params: IUpdateChefOrderStatusRequest) => {
      return updateChefOrderStatus(params)
    },
  })
}

export const useUpdateChefOrderItemStatus = () => {
  return useMutation({
    mutationFn: async (params: IUpdateChefOrderItemStatusRequest) => {
      return updateChefOrderItemStatus(params)
    },
  })
}
