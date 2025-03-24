import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useProductColumns } from './DataTable/columns'
import { useProducts } from '@/hooks'
import { ProductActionOptions } from './DataTable/actions'

export default function ProductTab() {
  const { data: products, isLoading } = useProducts()
  const [, setProductName] = useState<string>('')
  const handleSearchChange = (value: string) => {
    setProductName(value)
  }
  return (
    <div className="w-full">
      <DataTable
        columns={useProductColumns()}
        data={products?.result || []}
        isLoading={isLoading}
        pages={1}
        onInputChange={handleSearchChange}
        hiddenInput={false}
        onPageChange={() => { }}
        onPageSizeChange={() => { }}
        actionOptions={ProductActionOptions}
      />
    </div>
  )
}
