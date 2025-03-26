import { useState } from 'react'

import { DataTable } from '@/components/ui'
import { useProductColumns } from './DataTable/columns'
import { ProductActionOptions } from './DataTable/actions'
import { useProducts } from '@/hooks'

export default function ProductTab() {
  const { data: products, isLoading } = useProducts()
  const [, setProductName] = useState<string>('')

  const handleSearchChange = (value: string) => {
    setProductName(value)
  }
  return (
    <div className="grid h-full grid-cols-1 gap-2">
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
