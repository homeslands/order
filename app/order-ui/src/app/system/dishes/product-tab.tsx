import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { DataTable } from '@/components/ui'
import { useProductColumns } from './DataTable/columns'
import { ProductActionOptions } from './DataTable/actions'
import { usePagination, useProducts } from '@/hooks'
import { IProduct } from '@/types'
import { ROUTE } from '@/constants'

export default function ProductTab() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const { data: products, isLoading } = useProducts({
    page,
    size,
    hasPaging: true,
  })
  const [, setProductName] = useState<string>('')

  // add page size to query params
  useEffect(() => {
    setSearchParams((prev) => {
      prev.set('page', pagination.pageIndex.toString())
      prev.set('size', pagination.pageSize.toString())
      return prev
    })
  }, [pagination.pageIndex, pagination.pageSize, setSearchParams])

  const handleSearchChange = (value: string) => {
    setProductName(value)
  }

  const handleRowClick = (product: IProduct) => {
    navigate(`${ROUTE.STAFF_PRODUCT_MANAGEMENT}/${product.slug}`)
  }
  return (
    <div className="grid grid-cols-1 gap-2 h-full">
      <DataTable
        columns={useProductColumns()}
        data={products?.result.items || []}
        isLoading={isLoading}
        pages={products?.result.totalPages || 0}
        onInputChange={handleSearchChange}
        hiddenInput={false}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={ProductActionOptions}
        onRowClick={handleRowClick}
      />
    </div>
  )
}
