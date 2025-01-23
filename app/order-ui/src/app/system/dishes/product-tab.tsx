import { DataTable } from '@/components/ui'
import { useProductColumns } from './DataTable/columns'
import { useProducts } from '@/hooks'
import { ProductActionOptions } from './DataTable/actions'

export default function ProductTab() {
  const { data: products, isLoading } = useProducts()

  return (
    <div className="grid h-full grid-cols-1 gap-2">
      <DataTable
        columns={useProductColumns()}
        data={products?.result || []}
        isLoading={isLoading}
        pages={1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        actionOptions={ProductActionOptions}
      />
    </div>
  )
}
