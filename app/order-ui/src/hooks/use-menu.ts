import {
  createMenu,
  updateMenu,
  deleteMenu,
  getAllMenus,
  getSpecificMenu,
  addMenuItem,
  addMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getSpecificMenuItem,
} from '@/api'
import {
  IAddMenuItemRequest,
  ICreateMenuRequest,
  ISpecificMenuRequest,
  IUpdateMenuRequest,
  IUpdateMenuItemRequest,
  IAllMenuRequest,
} from '@/types'
import { useQuery, useMutation } from '@tanstack/react-query'

export const useAllMenus = (q: IAllMenuRequest) => {
  return useQuery({
    queryKey: ['menus', JSON.stringify(q)],
    queryFn: async () => getAllMenus(q),
  })
}

export const useSpecificMenu = (query: ISpecificMenuRequest) => {
  return useQuery({
    queryKey: ['specific-menu', query],
    queryFn: async () => getSpecificMenu(query),
  })
}

export const useSpecificMenuItem = (slug: string) => {
  return useQuery({
    queryKey: ['specific-menu-item', slug],
    queryFn: async () => getSpecificMenuItem(slug),
  })
}

export const useCreateMenu = () => {
  return useMutation({
    mutationFn: async (data: ICreateMenuRequest) => {
      return createMenu(data)
    },
  })
}

export const useUpdateMenu = () => {
  return useMutation({
    mutationFn: async (data: IUpdateMenuRequest) => {
      return updateMenu(data)
    },
  })
}

export const useDeleteMenu = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteMenu(slug)
    },
  })
}

export const useAddMenuItem = () => {
  return useMutation({
    mutationFn: async (data: IAddMenuItemRequest) => {
      return addMenuItem(data)
    },
  })
}

export const useAddMenuItems = () => {
  return useMutation({
    mutationFn: async (data: IAddMenuItemRequest[]) => {
      return addMenuItems(data)
    },
  })
}

export const useUpdateMenuItem = () => {
  return useMutation({
    mutationFn: async (data: IUpdateMenuItemRequest) => {
      return updateMenuItem(data)
    },
  })
}

export const useDeleteMenuItem = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteMenuItem(slug)
    },
  })
}
