import {
  createProduct,
  createProductVariant,
  deleteProduct,
  deleteProductImage,
  deleteProductVariant,
  exportAllProductsFile,
  getAllProducts,
  getAllProductVariant,
  getProductBySlug,
  getProductImportTemplate,
  getTopBranchProducts,
  getTopProducts,
  importProducts,
  updateProduct,
  updateProductVariant,
  uploadMultipleProductImages,
  uploadProductImage,
} from '@/api'
import {
  ICreateProductRequest,
  ICreateProductVariantRequest,
  ITopBranchProductQuery,
  ITopProductQuery,
  IUpdateProductRequest,
  IUpdateProductVariantRequest,
} from '@/types'
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query'

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProducts(),
    placeholderData: keepPreviousData,
  })
}

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    placeholderData: keepPreviousData,
  })
}

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (data: ICreateProductRequest) => {
      return createProduct(data)
    },
  })
}

export const useUploadProductImage = () => {
  return useMutation({
    mutationFn: async ({ slug, file }: { slug: string; file: File }) => {
      return uploadProductImage(slug, file)
    },
  })
}

export const useUploadMultipleProductImages = () => {
  return useMutation({
    mutationFn: async ({ slug, files }: { slug: string; files: File[] }) => {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })
      return uploadMultipleProductImages(slug, files)
    },
  })
}

export const useDeleteProductImage = () => {
  return useMutation({
    mutationFn: async ({ slug, image }: { slug: string; image: string }) => {
      return deleteProductImage(slug, image)
    },
  })
}

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async (data: IUpdateProductRequest) => {
      return updateProduct(data)
    },
  })
}

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteProduct(slug)
    },
  })
}

export const useAllProductVariant = () => {
  return useQuery({
    queryKey: ['productVariants'],
    queryFn: () => getAllProductVariant(),
    placeholderData: keepPreviousData,
  })
}

export const useCreateProductVariant = () => {
  return useMutation({
    mutationFn: async (data: ICreateProductVariantRequest) => {
      return createProductVariant(data)
    },
  })
}

export const useUpdateProductVariant = () => {
  return useMutation({
    mutationFn: async (data: IUpdateProductVariantRequest) => {
      return updateProductVariant(data)
    },
  })
}

export const useDeleteProductVariant = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteProductVariant(slug)
    },
  })
}

export const useTopProducts = (q: ITopProductQuery) => {
  return useQuery({
    queryKey: ['topProducts', JSON.stringify(q)],
    queryFn: () => getTopProducts(q),
    placeholderData: keepPreviousData,
  })
}

export const useTopBranchProducts = (q: ITopBranchProductQuery) => {
  return useQuery({
    queryKey: ['topBranchProducts', JSON.stringify(q)],
    queryFn: () => getTopBranchProducts(q),
    placeholderData: keepPreviousData,
  })
}

export const useExportAllProductsFile = () => {
  return useMutation({
    mutationFn: async () => {
      return exportAllProductsFile()
    },
  })
}

export const useExportProductImportTemplate = () => {
  return useMutation({
    mutationFn: async () => {
      return getProductImportTemplate()
    },
  })
}

export const useImportMultipleProducts = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return importProducts(file)
    },
  })
}
