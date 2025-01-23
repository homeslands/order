import { DataTable } from '@/components/ui'
import { useAllMenus, usePagination } from '@/hooks'
import { useMenusColumns } from './DataTable/columns'
import { MenusActionOptions } from './DataTable/actions'
import { useUserStore } from '@/stores'
import { IsTemplateFilter } from './DataTable/filters'

export default function MenuManagementPage() {
  const { userInfo } = useUserStore()
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const { data, isLoading } = useAllMenus({
    order: 'DESC',
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    branch: userInfo?.branch.slug,
  })

  return (
    <div className="grid h-full w-full grid-cols-1">
      <DataTable
        columns={useMenusColumns()}
        data={data?.result.items || []}
        isLoading={isLoading}
        pages={data?.result?.totalPages || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        actionOptions={MenusActionOptions}
        filterOptions={IsTemplateFilter}
      />
    </div>
  )
}
