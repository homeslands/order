import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { DataTable } from '@/components/ui'
import { useProductColumns } from './DataTable/columns'
import { ProductActionOptions, ProductFilterOptions } from './DataTable/actions'
import { useCatalogs, usePagination, useProducts } from '@/hooks'
import { IProduct } from '@/types'
import { ROUTE } from '@/constants'
import { useTranslation } from 'react-i18next'

export default function ProductTab() {
  const navigate = useNavigate()
  const { t } = useTranslation('catalog')
  const { t: tCommon } = useTranslation('common')
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10
  const [catalog, setCatalog] = useState<string | null>(null)
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const { data: products, isLoading } = useProducts({
    page,
    size,
    hasPaging: true,
    catalog: catalog || undefined,
  }, !!pagination.pageIndex)

  const { data: catalogs } = useCatalogs()
  const [, setProductName] = useState<string>('')

  const catalogsData = catalogs?.result

  const filterConfig = [
    {
      id: 'catalog',
      label: t('catalog.title'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        ...(catalogsData?.map(catalog => ({
          label: catalog.name.charAt(0).toUpperCase() + catalog.name.slice(1),
          value: catalog.slug,
        })) || []),
      ],
    },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'catalog') {
      setCatalog(value === 'all' ? null : value)
    }
  }

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
        hiddenInput={true}
        filterOptions={ProductFilterOptions}
        filterConfig={filterConfig}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={ProductActionOptions}
        onRowClick={handleRowClick}
      />
    </div>
  )
}
