import {
  addMultipleProductsToChefArea,
  addProductToChefArea,
  createChefArea,
  createChefOrder,
  createPrinterForChefArea,
  deleteChefArea,
  deletePrinterForChefArea,
  exportAutoChefOrderTicket,
  exportChefOrder,
  exportManualChefOrderTicket,
  getAllChefAreaProducts,
  getChefAreaBySlug,
  getChefAreas,
  getChefAreaSpecificProduct,
  getChefOrders,
  getPrinterForChefArea,
  getSpecificChefOrder,
  pingPrinterForChefArea,
  removeProductFromChefArea,
  togglePrinterForChefArea,
  updateChefArea,
  updateChefOrderItemStatus,
  updateChefOrderStatus,
  updatePrinterForChefArea,
  updateProductInChefArea,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  ICreateChefAreaProductRequest,
  ICreateChefAreaRequest,
  ICreateChefOrderRequest,
  ICreatePrinterForChefAreaRequest,
  IGetChefOrderRequest,
  IUpdateChefAreaProductRequest,
  IUpdateChefAreaRequest,
  IUpdateChefOrderItemStatusRequest,
  IUpdateChefOrderStatusRequest,
  IUpdatePrinterForChefAreaRequest,
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

export const useExportChefOrder = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return exportChefOrder(slug)
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
    queryKey: [QUERYKEY.chefOrders, params, params.order],
    queryFn: () => getChefOrders(params),
    select: (data) => data.result,
  })
}

export const useCreateChefOrder = () => {
  return useMutation({
    mutationFn: async (data: ICreateChefOrderRequest) => {
      return createChefOrder(data)
    },
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

export const useExportManualChefOrderTicket = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return exportManualChefOrderTicket(slug)
    },
  })
}

export const useExportAutoChefOrderTicket = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return exportAutoChefOrderTicket(slug)
    },
  })
}

export const useGetPrinterForChefArea = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.chefAreaPrinters, slug],
    queryFn: () => getPrinterForChefArea(slug),
  })
}

export const useCreatePrinterForChefArea = () => {
  return useMutation({
    mutationFn: async (data: ICreatePrinterForChefAreaRequest) => {
      return createPrinterForChefArea(data)
    },
  })
}

export const useUpdatePrinterForChefArea = () => {
  return useMutation({
    mutationFn: async (data: IUpdatePrinterForChefAreaRequest) => {
      return updatePrinterForChefArea(data)
    },
  })
}

export const useDeletePrinterForChefArea = () => {
  return useMutation({
    mutationFn: async ({ slug, printerSlug }: { slug: string; printerSlug: string }) => {
      return deletePrinterForChefArea(slug, printerSlug)
    },
  })
}
export const useTogglePrinterForChefArea = () => {
  return useMutation({
    mutationFn: async ({ slug, printerSlug }: { slug: string; printerSlug: string }) => {
      return togglePrinterForChefArea(slug, printerSlug)
    },
  })
}

export const usePingPrinterForChefArea = () => {
  return useMutation({
    mutationFn: async ({ slug, printerSlug }: { slug: string; printerSlug: string }) => {
      return pingPrinterForChefArea(slug, printerSlug)
    },
  })
}
