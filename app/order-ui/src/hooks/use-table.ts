import {
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  getAllLocations,
  createMultipleTables,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  ICreateMultipleTablesRequest,
  ICreateTableRequest,
  IUpdateTableRequest,
  IUpdateTableStatusRequest,
} from '@/types'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useTables = (branch?: string) => {
  return useQuery({
    queryKey: [QUERYKEY.tables, branch],
    queryFn: async () => getAllTables(branch as string),
  })
}

export const useCreateTable = () => {
  return useMutation({
    mutationFn: async (data: ICreateTableRequest) => createTable(data),
  })
}

export const useCreateMultipleTables = () => {
  return useMutation({
    mutationFn: async (data: ICreateMultipleTablesRequest) =>
      createMultipleTables(data),
  })
}

export const useUpdateTable = () => {
  return useMutation({
    mutationFn: async (data: IUpdateTableRequest) => updateTable(data),
  })
}

export const useDeleteTable = () => {
  return useMutation({
    mutationFn: async (slug: string) => deleteTable(slug),
  })
}

export const useUpdateTableStatus = () => {
  return useMutation({
    mutationFn: async (params: IUpdateTableStatusRequest) =>
      updateTableStatus(params),
  })
}

export const useAllTableLocations = () => {
  return useQuery({
    queryKey: ['tableLocations'],
    queryFn: async () => getAllLocations(),
  })
}
