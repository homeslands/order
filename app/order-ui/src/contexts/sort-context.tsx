import { createContext, useContext } from 'react'
import { SortOperation } from '@/constants'

export const SortContext = createContext<{
  onSort?: (operation: SortOperation) => void
}>({})

export const useSortContext = () => useContext(SortContext)
