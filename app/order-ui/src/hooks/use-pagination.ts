import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PaginationState } from '@tanstack/react-table'

export const usePagination = ({
  isSearchParams = true,
}: { isSearchParams?: boolean } = {}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = isSearchParams
    ? parseInt(searchParams.get('page') || '1', 10)
    : 1
  const pageSize = isSearchParams
    ? parseInt(searchParams.get('size') || '10', 10)
    : 10
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page,
    pageSize,
  })

  const handlePageChange = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }))
    if (isSearchParams) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('page', pageIndex.toString())
      setSearchParams(newParams)
    }
  }

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, pageIndex: 1 }))
    if (isSearchParams) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('size', pageSize.toString())
      newParams.set('page', '1')
      setSearchParams(newParams)
    }
  }

  // Sync pagination state with URL params
  useEffect(() => {
    if (isSearchParams) {
      setPagination({
        pageIndex: page,
        pageSize,
      })
    }
  }, [page, pageSize, isSearchParams])

  return { pagination, setPagination, handlePageChange, handlePageSizeChange }
}
